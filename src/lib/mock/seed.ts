import type { ComplaintStatus } from "@/types/complaint";
import type { Citizen, Employee } from "@/types/user";
import type { HistoryItem, InfoRequest } from "@/types/complaint";
import type { AuditLogEntry } from "@/types/audit";
import { COMPLAINT_TYPES, PROVINCES, AGENCIES } from "@/constants/reference-data";

export interface MockAttachment {
  id: number;
  originalFilename: string;
  content: string;
}

export interface MockComplaint {
  id: number;
  status: ComplaintStatus;
  complaintType: string;
  governorate: string;
  governmentAgency: string;
  location: string;
  description: string;
  solutionSuggestion: string;
  response: string | null;
  respondedAt: string | null;
  respondedById: number | null;
  respondedByName: string | null;
  attachments: MockAttachment[];
  citizenId: number;
  citizenName: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string;
}

export interface MockStoreData {
  complaints: MockComplaint[];
  citizens: Citizen[];
  employees: Employee[];
  history: HistoryItem[];
  infoRequests: InfoRequest[];
  auditLogs: AuditLogEntry[];
  nextComplaintId: number;
  nextEmployeeId: number;
  nextHistoryId: number;
  nextInfoRequestId: number;
  nextAuditId: number;
  nextAttachmentId: number;
}

const STATUSES: ComplaintStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

const CITIZEN_NAMES = [
  "خالد الحسن",
  "فاطمة العلي",
  "عمر الشامي",
  "ليلى محمود",
  "يوسف ناصر",
  "نور الدين",
  "ريم أحمد",
  "بسام كريم",
  "هناء سعيد",
  "طارق يوسف",
  "سلمى حاتم",
  "وائل عثمان",
  "دانا فرحات",
  "مازن جابر",
  "سمر الحلبي",
];

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function trackingNum(id: number): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `SHK-${y}${m}${day}-${String(id).padStart(4, "0")}`;
}

export function createSeedData(): MockStoreData {
  const citizens: Citizen[] = CITIZEN_NAMES.map((name, i) => ({
    id: i + 1,
    name,
    email: `citizen${i + 1}@example.com`,
    isActive: i !== 3 && i !== 7,
  }));

  const employees: Employee[] = [
    { id: 1, firstName: "سارة", lastName: "المشرفة", email: "supervisor@demo.com", phoneNumber: "0991234567", roleName: "SUPERVISOR", status: "ACTIVE" },
    { id: 2, firstName: "محمد", lastName: "المشاهد", email: "viewer@demo.com", phoneNumber: "0992345678", roleName: "VIEWER", status: "ACTIVE" },
    { id: 3, firstName: "لينا", lastName: "الصالح", email: "lina@health.gov.sy", phoneNumber: "0993456789", roleName: "SUPERVISOR", status: "ACTIVE" },
    { id: 4, firstName: "كريم", lastName: "الحموي", email: "karim@edu.gov.sy", phoneNumber: "0994567890", roleName: "VIEWER", status: "ACTIVE" },
    { id: 5, firstName: "رنا", lastName: "الخطيب", email: "rana@finance.gov.sy", phoneNumber: "0995678901", roleName: "VIEWER", status: "DISABLED" },
    { id: 6, firstName: "علي", lastName: "الدمشقي", email: "ali@transport.gov.sy", phoneNumber: "0996789012", roleName: "SUPERVISOR", status: "ACTIVE" },
    { id: 7, firstName: "مريم", lastName: "الحلبية", email: "maryam@justice.gov.sy", phoneNumber: "0997890123", roleName: "VIEWER", status: "ACTIVE" },
    { id: 8, firstName: "حسام", lastName: "الطرطوسي", email: "hussam@interior.gov.sy", phoneNumber: "0998901234", roleName: "VIEWER", status: "ACTIVE" },
  ];

  const complaints: MockComplaint[] = [];
  const history: HistoryItem[] = [];
  const infoRequests: InfoRequest[] = [];
  let historyId = 1;
  let infoId = 1;
  let attachId = 1;

  for (let i = 1; i <= 25; i++) {
    const citizen = citizens[(i - 1) % citizens.length];
    const status = STATUSES[(i - 1) % STATUSES.length];
    const hasAttachments = i % 3 === 0;
    const attachments: MockAttachment[] = hasAttachments
      ? [{ id: attachId++, originalFilename: `مرفق-شكوى-${i}.pdf`, content: `محتوى تجريبي للمرفق ${i}` }]
      : [];

    const createdDaysAgo = 30 - i;
    const complaint: MockComplaint = {
      id: i,
      status,
      complaintType: COMPLAINT_TYPES[(i - 1) % COMPLAINT_TYPES.length],
      governorate: PROVINCES[(i - 1) % PROVINCES.length],
      governmentAgency: AGENCIES[(i - 1) % AGENCIES.length],
      location: `حي ${i} - شارع ${i + 10}`,
      description: `وصف تفصيلي للشكوى رقم ${i}. يشكو المواطن من ${COMPLAINT_TYPES[(i - 1) % COMPLAINT_TYPES.length]} في ${AGENCIES[(i - 1) % AGENCIES.length]}.`,
      solutionSuggestion: `اقتراح حل: معالجة الطلب خلال ${i + 2} أيام عمل وإبلاغ المواطن بالنتيجة.`,
      response: status === "RESOLVED" || status === "CLOSED" ? `تمت معالجة الشكوى رقم ${i} وفق الإجراءات المعتمدة.` : null,
      respondedAt: status === "RESOLVED" || status === "CLOSED" ? dateOffset(createdDaysAgo - 2) : null,
      respondedById: status === "RESOLVED" || status === "CLOSED" ? 1 : null,
      respondedByName: status === "RESOLVED" || status === "CLOSED" ? "سارة المشرفة" : null,
      attachments,
      citizenId: citizen.id,
      citizenName: citizen.name,
      createdAt: dateOffset(createdDaysAgo),
      updatedAt: dateOffset(Math.max(0, createdDaysAgo - 1)),
      trackingNumber: trackingNum(i),
    };
    complaints.push(complaint);

    history.push({
      id: historyId++,
      actionType: "CREATE",
      actionDescription: `تم إنشاء الشكوى برقم تتبع ${complaint.trackingNumber}`,
      actorId: citizen.id,
      actorName: citizen.name,
      actorEmail: citizen.email,
      fieldChanged: "status",
      oldValue: null,
      newValue: "PENDING",
      createdAt: complaint.createdAt,
    });

    history.push({
      id: historyId++,
      actionType: "UPDATE",
      actionDescription: `تم تحديث حالة الشكوى إلى ${status}`,
      actorId: 1,
      actorName: "سارة المشرفة",
      actorEmail: "supervisor@demo.com",
      fieldChanged: "status",
      oldValue: "PENDING",
      newValue: status,
      createdAt: complaint.updatedAt,
    });

    if (i <= 8) {
      infoRequests.push({
        id: infoId++,
        complaintId: i,
        requestedBy: { id: 1, name: "سارة المشرفة", email: "supervisor@demo.com" },
        requestMessage: `نحتاج مستندات إضافية لإكمال معالجة الشكوى رقم ${i}.`,
        status: i % 2 === 0 ? "ANSWERED" : "PENDING",
        requestedAt: dateOffset(createdDaysAgo - 1),
        respondedAt: i % 2 === 0 ? dateOffset(createdDaysAgo - 2) : null,
        responseMessage: i % 2 === 0 ? "تم إرفاق المستندات المطلوبة." : null,
        attachments: i % 2 === 0
          ? [{ id: attachId++, originalFilename: `رد-مواطن-${i}.jpg`, downloadUrl: `/api/v1/complaints/${i}/attachments/${attachId - 1}` }]
          : [],
      });
    }
  }

  const auditActions = [
    "LOGIN", "LOGIN_EMPLOYEE", "CREATE_COMPLAINT", "UPDATE_COMPLAINT",
    "RESPOND_TO_COMPLAINT", "REQUEST_ADDITIONAL_INFO", "CREATE_EMPLOYEE",
    "UPDATE_EMPLOYEE", "RESET_PASSWORD", "UPDATE_USER_PERMISSIONS",
  ];
  const targetTypes = ["USER", "COMPLAINT", "EMPLOYEE", "CITIZEN", "INFORMATION_REQUEST"];

  const auditLogs: AuditLogEntry[] = Array.from({ length: 50 }, (_, i) => {
    const actor = employees[i % employees.length];
    const action = auditActions[i % auditActions.length];
    const ts = dateOffset(50 - i);
    return {
      id: i + 1,
      userId: actor.id,
      actorId: actor.id,
      userName: `${actor.firstName} ${actor.lastName}`,
      actorName: `${actor.firstName} ${actor.lastName}`,
      action,
      targetType: targetTypes[i % targetTypes.length],
      targetId: String((i % 25) + 1),
      details: `تفاصيل العملية ${action} رقم ${i + 1}`,
      status: i % 10 === 0 ? "FAILURE" : "SUCCESS",
      ipAddress: `192.168.1.${(i % 254) + 1}`,
      timestamp: ts,
      createdAt: ts,
    };
  });

  return {
    complaints,
    citizens,
    employees,
    history,
    infoRequests,
    auditLogs,
    nextComplaintId: 26,
    nextEmployeeId: 9,
    nextHistoryId: historyId,
    nextInfoRequestId: infoId,
    nextAuditId: 51,
    nextAttachmentId: attachId,
  };
}
