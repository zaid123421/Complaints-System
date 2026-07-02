"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import type { Citizen, Employee } from "@/types/user";
import type { PaginatedResponse } from "@/types/api";
import {
  getCitizens,
  searchCitizens,
  getEmployees,
  deleteEmployee,
  resetPassword,
  suspendCitizen,
  unsuspendCitizen,
  updateEmployeeRole,
  updateEmployeeStatus,
} from "@/lib/api/users";

type UserType = "citizens" | "employees";

export default function UsersPage() {
  const [userType, setUserType] = useState<UserType>("citizens");
  const [citizenData, setCitizenData] = useState<PaginatedResponse<Citizen> | null>(null);
  const [employeeData, setEmployeeData] = useState<PaginatedResponse<Employee> | null>(null);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // States للمودلز
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [targetCitizenId, setTargetCitizenId] = useState<number | null>(null);

  // States لمودل تغيير كلمة المرور
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [targetEmployeeId, setTargetEmployeeId] = useState<number | null>(null);

  const size = 10;
  const token = Cookies.get("token");

  const showNotify = (msg: string, type: "success" | "error") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      if (userType === "citizens") {
        const json = searchQuery.trim()
          ? await searchCitizens(searchQuery, page, size)
          : await getCitizens(page, size);
        setCitizenData(json);
      } else {
        const json = await getEmployees();
        setEmployeeData({
          content: json,
          page: 0,
          size: json.length,
          totalElements: json.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        });
      }
    } catch {
      showNotify("فشل في جلب البيانات", "error");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف نهائياً؟")) return;
    setLoadingId(id);
    try {
      await deleteEmployee(id);
      showNotify("تم حذف الموظف بنجاح", "success");
      if (employeeData) {
        setEmployeeData({
          ...employeeData,
          content: employeeData.content.filter((e) => e.id !== id),
        });
      }
    } catch {
      showNotify("فشل في حذف الموظف", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleChangePassword = async () => {
    if (!targetEmployeeId || !newPassword.trim()) return;
    setLoadingId(targetEmployeeId);
    setIsPasswordModalOpen(false);

    try {
      await resetPassword(targetEmployeeId, newPassword);
      showNotify("تم تغيير كلمة المرور بنجاح", "success");
    } catch {
      showNotify("فشل في تغيير كلمة المرور", "error");
    } finally {
      setLoadingId(null);
      setNewPassword("");
      setTargetEmployeeId(null);
    }
  };

  const handleUnsuspend = async (id: number) => {
    setLoadingId(id);
    try {
      await unsuspendCitizen(id);
      showNotify("تم فك الحظر بنجاح", "success");
      if (citizenData) {
        setCitizenData({
          ...citizenData,
          content: citizenData.content.map((c) => (c.id === id ? { ...c, isActive: true } : c)),
        });
      }
    } catch {
      showNotify("خطأ في الاتصال", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspendConfirm = async () => {
    if (!targetCitizenId || !suspendReason.trim()) return;
    setLoadingId(targetCitizenId);
    setIsSuspendModalOpen(false);
    try {
      await suspendCitizen(targetCitizenId, suspendReason);
      showNotify("تم الحظر بنجاح", "success");
      if (citizenData) {
        setCitizenData({
          ...citizenData,
          content: citizenData.content.map((c) =>
            c.id === targetCitizenId ? { ...c, isActive: false } : c
          ),
        });
      }
    } catch {
      showNotify("فشل الحظر", "error");
    } finally {
      setLoadingId(null);
      setSuspendReason("");
      setTargetCitizenId(null);
    }
  };

  const updateEmployeeRoleHandler = async (id: number, newRole: string) => {
    setLoadingId(id);
    try {
      await updateEmployeeRole(id, newRole);
      if (employeeData) {
        setEmployeeData({
          ...employeeData,
          content: employeeData.content.map((e) => (e.id === id ? { ...e, roleName: newRole } : e)),
        });
        showNotify("تم تحديث الدور", "success");
      }
    } catch {
      showNotify("حدث خطأ", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (id: number, current: string, target: string) => {
    if ((current === "ACTIVE" ? "enable" : "disable") === target) return;
    setLoadingId(id);
    try {
      await updateEmployeeStatus(id, target as "enable" | "disable");
      if (employeeData) {
        setEmployeeData({
          ...employeeData,
          content: employeeData.content.map((e) =>
            e.id === id ? { ...e, status: target === "enable" ? "ACTIVE" : "DISABLED" } : e
          ),
        });
        showNotify("تم تحديث الحالة", "success");
      }
    } catch {
      showNotify("حدث خطأ", "error");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(delay);
  }, [page, userType, searchQuery]);

  const activeData = userType === "citizens" ? citizenData : employeeData;

  return (
    <div className="p-6 pl-12 w-full space-y-6 relative">
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-2xl shadow-xl font-bold text-white transition-all ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {notification.msg}
        </div>
      )}

      {isSuspendModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 h-full">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">سبب الحظر <span className="text-red-500">*</span></h3>
            <textarea className="resize-none w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 h-32 text-sm" placeholder="أدخل السبب..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <button onClick={handleSuspendConfirm} className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold">تأكيد</button>
              <button onClick={() => setIsSuspendModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 h-full">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">تغيير كلمة المرور <span className="text-orange-500">*</span></h3>
            <input 
                type="password"
                className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-orange-500 text-sm" 
                placeholder="أدخل كلمة المرور الجديدة..." 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleChangePassword} className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-bold">تحديث</button>
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center mb-4 gap-4">
        <h1 className="text-[32px] font-bold">{userType === "citizens" ? "المواطنين" : "الموظفين"}</h1>
        {userType === "employees" && (
            <Link href="/users/add" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-500/20">إضافة موظف +</Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-start gap-2 mb-6">
        <button onClick={() => {setUserType("citizens"); setPage(0);}} className={`px-8 py-2 rounded-xl font-bold transition-all ${userType === "citizens" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-gray-100 text-gray-500"}`}>مواطنين</button>
        <button onClick={() => {setUserType("employees"); setPage(0);}} className={`px-8 py-2 rounded-xl font-bold transition-all ${userType === "employees" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-gray-100 text-gray-500"}`}>موظفين</button>
      </div>

      {userType === "citizens" && (
        <div className="flex flex-col gap-2 max-w-sm">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> البحث عن المواطنين</label>
          <input type="text" placeholder="ابحث بالاسم..." value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setPage(0);}} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm" />
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-auto mt-4">
        <table className="w-full text-right border-collapse">
          <thead className={userType === "citizens" ? "bg-orange-50" : "bg-blue-50"}>
            <tr>
              <th className="p-4 text-center font-bold text-gray-700">الاسم</th>
              <th className="p-4 text-center font-bold text-gray-700">البريد الإلكتروني</th>
              {userType === "employees" && <th className="p-4 text-center font-bold text-gray-700">الهاتف</th>}
              {userType === "employees" && <th className="p-4 text-center font-bold text-gray-700">الدور</th>}
              <th className="p-4 text-center font-bold text-gray-700">الحالة</th>
              {userType === "employees" && <th className="p-4 text-center font-bold text-gray-700">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-center text-sm">
            {userType === "citizens" ? citizenData?.content.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${loadingId === user.id ? "opacity-40" : ""}`}>
                <td className="p-4 font-bold text-gray-800">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <select 
                      value={user.isActive ? "unsuspend" : "suspend"} 
                      onChange={(e) => e.target.value === "suspend" ? (setTargetCitizenId(user.id), setIsSuspendModalOpen(true)) : handleUnsuspend(user.id)} 
                      className={`px-3 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      <option value="unsuspend">نشط</option>
                      <option value="suspend">محظور</option>
                    </select>
                  </div>
                </td>
              </tr>
            )) : employeeData?.content.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${loadingId === user.id ? "opacity-40" : ""}`}>
                <td className="p-4 font-bold text-gray-800">{user.firstName} {user.lastName}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-gray-600">{user.phoneNumber}</td>
                <td className="p-4">
                    <select value={user.roleName} onChange={(e) => updateEmployeeRoleHandler(user.id, e.target.value)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer">
                        <option value="VIEWER">VIEWER</option>
                        <option value="SUPERVISOR">SUPERVISOR</option>
                    </select>
                </td>
                <td className="p-4">
                    <div className="flex justify-center">
                      <select value={user.status === "ACTIVE" ? "enable" : "disable"} onChange={(e) => handleStatusChange(user.id, user.status, e.target.value)} className={`px-3 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <option value="enable">Enabled</option>
                          <option value="disable">Disabled</option>
                      </select>
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex gap-2 justify-center items-center">
                        <button 
                            onClick={() => {setTargetEmployeeId(user.id); setIsPasswordModalOpen(true);}}
                            className="bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap"
                        >
                            تغيير الرمز 🔑
                        </button>
                        <button 
                            onClick={() => handleDeleteEmployee(user.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap"
                        >
                            حذف 🗑️
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeData && activeData.totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center mt-6">
          <button disabled={!activeData.hasPrevious} onClick={() => setPage((p) => p - 1)} className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 font-bold">السابق</button>
          <span className="text-gray-600 font-medium">صفحة <span className="text-orange-500 font-bold">{Number(activeData.page) + 1}</span> من {activeData.totalPages}</span>
          <button disabled={!activeData.hasNext} onClick={() => setPage((p) => p + 1)} className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 font-bold">التالي</button>
        </div>
      )}
    </div>
  );
}