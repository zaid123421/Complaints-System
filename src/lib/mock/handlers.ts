import { NextRequest, NextResponse } from "next/server";
import { DEMO_ACCOUNTS } from "@/constants/reference-data";
import type { DashboardData } from "@/types/dashboard";
import type { ReportData, StatusResponse, AvgResolutionTimeResponse } from "@/types/reports";
import {
  getStore,
  paginate,
  requireAuth,
  statusToDetail,
  statusFromDetail,
  addAuditLog,
} from "./store";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function unauthorized() {
  return json({ message: "غير مصرح" }, 401);
}

function notFound(message = "غير موجود") {
  return json({ message }, 404);
}

function getInt(searchParams: URLSearchParams, key: string, fallback: number) {
  const v = searchParams.get(key);
  return v ? parseInt(v, 10) : fallback;
}

function filterByDate<T extends { createdAt: string }>(
  items: T[],
  fromDate?: string | null,
  toDate?: string | null
): T[] {
  return items.filter((item) => {
    const d = item.createdAt.split("T")[0];
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });
}

function buildDashboard(complaints: ReturnType<typeof getStore>["complaints"], fromDate?: string | null, toDate?: string | null, overdueDays = 30): DashboardData {
  const filtered = filterByDate(complaints, fromDate, toDate);
  const resolved = filtered.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const open = filtered.filter((c) => c.status === "PENDING" || c.status === "IN_PROGRESS");

  const agencyMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  filtered.forEach((c) => {
    agencyMap.set(c.governmentAgency, (agencyMap.get(c.governmentAgency) || 0) + 1);
    typeMap.set(c.complaintType, (typeMap.get(c.complaintType) || 0) + 1);
  });

  const now = Date.now();
  const overdue = filtered.filter((c) => {
    if (c.status === "RESOLVED" || c.status === "CLOSED") return false;
    const created = new Date(c.createdAt).getTime();
    return (now - created) / (1000 * 60 * 60 * 24) > overdueDays;
  });

  return {
    totalComplaints: filtered.length,
    resolvedComplaints: resolved.length,
    openComplaints: open.length,
    overdueComplaints: overdue.length,
    averageResolutionTimeDays: 5,
    averageResolutionTimeHours: 12,
    topAgenciesByComplaints: [...agencyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([agency, count]) => ({
        agencyName: agency,
        agencyLabel: agency.replace("وزارة ", ""),
        complaintCount: count,
      })),
    topComplaintTypes: [...typeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, count]) => ({
        typeName: type,
        typeLabel: type,
        complaintCount: count,
      })),
  };
}

export async function handleMockRequest(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const method = request.method;
  const path = pathSegments.join("/");
  const store = getStore();
  const auth = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;

  // --- Auth (no token required) ---
  if (method === "POST" && path === "admin/login") {
    const body = await request.json();
    const account = DEMO_ACCOUNTS.admin;
    if (body.email === account.email && body.password === account.password) {
      return json({
        token: "mock-token-admin",
        role: account.role,
        firstName: account.firstName,
        lastName: account.lastName,
      });
    }
    return json({ message: "بيانات الدخول غير صحيحة" }, 401);
  }

  if (method === "POST" && path === "employees/login") {
    const body = await request.json();
    const employeeAccounts = [DEMO_ACCOUNTS.supervisor, DEMO_ACCOUNTS.viewer];
    const match = employeeAccounts.find(
      (a) => a.email === body.email && a.password === body.password
    );
    if (match) {
      const tokenKey = match.role === "SUPERVISOR" ? "supervisor" : "viewer";
      return json({
        token: `mock-token-${tokenKey}`,
        role: match.role,
        firstName: match.firstName,
        lastName: match.lastName,
      });
    }
    return json({ message: "بيانات الدخول غير صحيحة" }, 401);
  }

  if (method === "POST" && path === "auth/logout") {
    if (!requireAuth(auth)) return unauthorized();
    return json({ message: "تم تسجيل الخروج" });
  }

  // --- Protected routes ---
  if (!requireAuth(auth)) return unauthorized();

  // Complaints filter
  if (method === "GET" && path === "complaints/filter") {
    const page = getInt(searchParams, "page", 0);
    const size = getInt(searchParams, "size", 9);
    const status = searchParams.get("status");
    const complaintType = searchParams.get("complaintType");
    const governorate = searchParams.get("governorate");
    const governmentAgency = searchParams.get("governmentAgency");

    let filtered = [...store.complaints];
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (complaintType) filtered = filtered.filter((c) => c.complaintType === complaintType);
    if (governorate) filtered = filtered.filter((c) => c.governorate === governorate);
    if (governmentAgency) filtered = filtered.filter((c) => c.governmentAgency === governmentAgency);

    const result = paginate(
      filtered.map((c) => ({
        ...c,
        attachments: c.attachments.map((a) => a.originalFilename),
      })),
      page,
      size
    );
    return json(result);
  }

  // Tracking
  const trackingMatch = path.match(/^complaints\/tracking\/(.+)$/);
  if (method === "GET" && trackingMatch) {
    const trackingNumber = decodeURIComponent(trackingMatch[1]);
    const complaint = store.complaints.find((c) => c.trackingNumber === trackingNumber);
    if (!complaint) return notFound("الشكوى غير موجودة");
    return json({
      ...complaint,
      attachments: complaint.attachments.map((a) => a.originalFilename),
    });
  }

  // Complaint detail
  const complaintMatch = path.match(/^complaints\/(\d+)$/);
  if (method === "GET" && complaintMatch) {
    const id = parseInt(complaintMatch[1], 10);
    const complaint = store.complaints.find((c) => c.id === id);
    if (!complaint) return notFound();
    return json({
      id: complaint.id,
      status: statusToDetail(complaint.status),
      complaintType: complaint.complaintType,
      governorate: complaint.governorate,
      governmentAgency: complaint.governmentAgency,
      location: complaint.location,
      description: complaint.description,
      response: complaint.response,
      solutionSuggestion: complaint.solutionSuggestion,
      attachments: complaint.attachments.map((a) => ({
        id: a.id,
        originalFilename: a.originalFilename,
        downloadUrl: `/api/v1/complaints/${id}/attachments/${a.id}`,
      })),
    });
  }

  // History
  const historyMatch = path.match(/^complaints\/(\d+)\/history$/);
  if (method === "GET" && historyMatch) {
    const id = parseInt(historyMatch[1], 10);
    const page = getInt(searchParams, "page", 0);
    const size = getInt(searchParams, "size", 10);
    const items = store.history.filter((h) => {
      const complaint = store.complaints.find((c) => c.id === id);
      if (!complaint) return false;
      return h.actionDescription.includes(complaint.trackingNumber) ||
        (h.newValue === complaint.status && h.oldValue !== null);
    });
    const complaintHistory = store.history.filter((_, idx) => {
      const complaintIdx = (id - 1) * 2;
      return idx >= complaintIdx && idx < complaintIdx + 2;
    });
    return json(paginate(complaintHistory.length > 0 ? complaintHistory : items, page, size));
  }

  // Info requests
  const infoMatch = path.match(/^complaints\/(\d+)\/info-requests$/);
  if (infoMatch) {
    const id = parseInt(infoMatch[1], 10);
    if (method === "GET") {
      const items = store.infoRequests.filter((r) => r.complaintId === id);
      return json({ content: items });
    }
    if (method === "POST") {
      const body = await request.json();
      const newReq = {
        id: store.nextInfoRequestId++,
        complaintId: id,
        requestedBy: { id: 1, name: "سارة المشرفة", email: "supervisor@demo.com" },
        requestMessage: body.message,
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        respondedAt: null,
        responseMessage: null,
        attachments: [] as { id: number; originalFilename: string; downloadUrl: string }[],
      };
      store.infoRequests.push(newReq);
      addAuditLog(store, {
        userId: 1, actorId: 1, userName: "سارة المشرفة", actorName: "سارة المشرفة",
        action: "REQUEST_ADDITIONAL_INFO", targetType: "INFORMATION_REQUEST",
        targetId: String(newReq.id), details: body.message, status: "SUCCESS", ipAddress: "127.0.0.1",
      });
      return json(newReq, 201);
    }
  }

  // Respond
  const respondMatch = path.match(/^complaints\/(\d+)\/respond$/);
  if (method === "PUT" && respondMatch) {
    const id = parseInt(respondMatch[1], 10);
    const complaint = store.complaints.find((c) => c.id === id);
    if (!complaint) return notFound();
    const status = searchParams.get("status") || complaint.status;
    const response = searchParams.get("response") || "";
    complaint.status = statusFromDetail(status) as typeof complaint.status;
    complaint.response = response;
    complaint.respondedAt = new Date().toISOString();
    complaint.respondedById = 1;
    complaint.respondedByName = "سارة المشرفة";
    complaint.updatedAt = new Date().toISOString();
    addAuditLog(store, {
      userId: 1, actorId: 1, userName: "سارة المشرفة", actorName: "سارة المشرفة",
      action: "RESPOND_TO_COMPLAINT", targetType: "COMPLAINT",
      targetId: String(id), details: response, status: "SUCCESS", ipAddress: "127.0.0.1",
    });
    return json(complaint);
  }

  // Attachment download
  const attachmentMatch = path.match(/^complaints\/(\d+)\/attachments\/(\d+)$/);
  if (method === "GET" && attachmentMatch) {
    const complaintId = parseInt(attachmentMatch[1], 10);
    const attId = parseInt(attachmentMatch[2], 10);
    const complaint = store.complaints.find((c) => c.id === complaintId);
    const att = complaint?.attachments.find((a) => a.id === attId);
    const infoAtt = store.infoRequests
      .flatMap((r) => r.attachments)
      .find((a) => a.id === attId);
    const filename = att?.originalFilename || infoAtt?.originalFilename || "file.txt";
    const content = att?.content || "محتوى تجريبي للمرفق";
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Dashboard
  if (method === "GET" && path === "admin/dashboard/overview") {
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const overdueDays = getInt(searchParams, "overdueDaysThreshold", 30);
    return json(buildDashboard(store.complaints, fromDate, toDate, overdueDays));
  }

  if (method === "GET" && path === "admin/dashboard/export") {
    const data = buildDashboard(
      store.complaints,
      searchParams.get("fromDate"),
      searchParams.get("toDate"),
      getInt(searchParams, "overdueDaysThreshold", 30)
    );
    const text = `تقرير لوحة التحكم\nإجمالي الشكاوي: ${data.totalComplaints}\nالمحلولة: ${data.resolvedComplaints}\nالمفتوحة: ${data.openComplaints}`;
    return new NextResponse(text, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="dashboard-report.pdf"',
      },
    });
  }

  // Citizens
  if (method === "GET" && path === "citizens") {
    const page = getInt(searchParams, "page", 0);
    const size = getInt(searchParams, "size", 10);
    return json(paginate(store.citizens, page, size));
  }

  if (method === "GET" && path === "citizens/search") {
    const name = searchParams.get("name") || "";
    const page = getInt(searchParams, "page", 0);
    const size = getInt(searchParams, "size", 10);
    const filtered = store.citizens.filter((c) => c.name.includes(name));
    return json(paginate(filtered, page, size));
  }

  // Employees
  if (method === "GET" && path === "employees") {
    return json(store.employees);
  }

  if (method === "POST" && path === "employees") {
    const body = await request.json();
    const id = store.nextEmployeeId++;
    const email = `${body.firstName.toLowerCase()}.${body.lastName.toLowerCase()}@gov.sy`;
    const employee = {
      id,
      firstName: body.firstName,
      lastName: body.lastName,
      email,
      phoneNumber: body.phoneNumber,
      roleName: body.roleName,
      status: body.status === "INACTIVE" ? "DISABLED" : "ACTIVE",
    };
    store.employees.push(employee);
    addAuditLog(store, {
      userId: 1, actorId: 1, userName: "أحمد المدير", actorName: "أحمد المدير",
      action: "CREATE_EMPLOYEE", targetType: "EMPLOYEE",
      targetId: String(id), details: `إنشاء موظف ${body.firstName}`, status: "SUCCESS", ipAddress: "127.0.0.1",
    });
    return json({ ...employee, email }, 201);
  }

  const deleteEmployeeMatch = path.match(/^employees\/(\d+)$/);
  if (method === "DELETE" && deleteEmployeeMatch) {
    const id = parseInt(deleteEmployeeMatch[1], 10);
    store.employees = store.employees.filter((e) => e.id !== id);
    return json({ message: "تم الحذف" });
  }

  // Password reset
  if (method === "PUT" && path === "password/reset") {
    return json({ message: "تم تغيير كلمة المرور" });
  }

  // Citizen suspend/unsuspend
  const suspendMatch = path.match(/^admin\/users\/citizens\/(\d+)\/suspend$/);
  if (method === "PUT" && suspendMatch) {
    const id = parseInt(suspendMatch[1], 10);
    const citizen = store.citizens.find((c) => c.id === id);
    if (citizen) citizen.isActive = false;
    return json(citizen);
  }

  const unsuspendMatch = path.match(/^admin\/users\/citizens\/(\d+)\/unsuspend$/);
  if (method === "PUT" && unsuspendMatch) {
    const id = parseInt(unsuspendMatch[1], 10);
    const citizen = store.citizens.find((c) => c.id === id);
    if (citizen) citizen.isActive = true;
    return json(citizen);
  }

  // Employee role/status
  const roleMatch = path.match(/^admin\/users\/employees\/(\d+)\/role$/);
  if (method === "PUT" && roleMatch) {
    const id = parseInt(roleMatch[1], 10);
    const roleName = searchParams.get("roleName");
    const employee = store.employees.find((e) => e.id === id);
    if (employee && roleName) employee.roleName = roleName;
    return json(employee);
  }

  const enableMatch = path.match(/^admin\/users\/employees\/(\d+)\/(enable|disable)$/);
  if (method === "PUT" && enableMatch) {
    const id = parseInt(enableMatch[1], 10);
    const action = enableMatch[2];
    const employee = store.employees.find((e) => e.id === id);
    if (employee) employee.status = action === "enable" ? "ACTIVE" : "DISABLED";
    return json(employee);
  }

  // Reports
  if (method === "GET" && path === "reports/complaint-type-distribution") {
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const filtered = filterByDate(store.complaints, fromDate, toDate);
    const typeMap = new Map<string, number>();
    filtered.forEach((c) => typeMap.set(c.complaintType, (typeMap.get(c.complaintType) || 0) + 1));
    const total = filtered.length || 1;
    const distribution = [...typeMap.entries()].map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
    }));
    const data: ReportData = { distribution, totalComplaints: filtered.length, agency: "الكل" };
    return json(data);
  }

  if (method === "GET" && path === "reports/complaint-status") {
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const filtered = filterByDate(store.complaints, fromDate, toDate);
    const data: StatusResponse = {
      totalComplaints: filtered.length,
      resolvedCount: filtered.filter((c) => c.status === "RESOLVED").length,
      inProgressCount: filtered.filter((c) => c.status === "IN_PROGRESS").length,
      pendingCount: filtered.filter((c) => c.status === "PENDING").length,
      rejectedCount: filtered.filter((c) => c.status === "REJECTED").length,
      closedCount: filtered.filter((c) => c.status === "CLOSED").length,
      agency: "الكل",
    };
    return json(data);
  }

  if (method === "GET" && path === "reports/average-resolution-time") {
    const filtered = filterByDate(store.complaints, searchParams.get("fromDate"), searchParams.get("toDate"));
    const resolved = filtered.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
    const data: AvgResolutionTimeResponse = {
      averageDays: 4.5,
      averageHours: 18,
      minResolutionDays: 1,
      maxResolutionDays: 15,
      totalResolvedComplaints: resolved.length,
      agency: "الكل",
    };
    return json(data);
  }

  const reportExportMatch = path.match(/^reports\/(.+)\/export$/);
  if (method === "GET" && reportExportMatch) {
    const endpoint = reportExportMatch[1];
    const format = searchParams.get("format") || "csv";
    const content = `تقرير,${endpoint}\nبيانات,تجريبية\n`;
    const contentType = format === "pdf" ? "application/pdf" : "text/csv";
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report.${format}"`,
      },
    });
  }

  // Audit log
  if (method === "GET" && path === "admin/audit-log") {
    const page = getInt(searchParams, "page", 0);
    const size = getInt(searchParams, "size", 20);
    let filtered = [...store.auditLogs];
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const status = searchParams.get("status");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (userId) filtered = filtered.filter((l) => l.actorId === parseInt(userId, 10));
    if (action) filtered = filtered.filter((l) => l.action === action);
    if (targetType) filtered = filtered.filter((l) => l.targetType === targetType);
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (fromDate) filtered = filtered.filter((l) => l.createdAt >= fromDate);
    if (toDate) filtered = filtered.filter((l) => l.createdAt <= toDate);

    return json(paginate(filtered, page, size));
  }

  if (method === "GET" && path === "admin/audit-log/export") {
    const header = "id,actorName,action,targetType,status,createdAt\n";
    const rows = store.auditLogs.map((l) =>
      `${l.id},${l.actorName},${l.action},${l.targetType},${l.status},${l.createdAt}`
    ).join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="audit-log.csv"',
      },
    });
  }

  return notFound(`المسار غير موجود: ${path}`);
}
