"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AiOutlineHistory, AiOutlineSearch, AiOutlineDownload } from "react-icons/ai";

// --- الواجهات (Interfaces) ---

interface AuditLogEntry {
  id: number;
  userId: number;
  actorId: number;
  userName: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  status: "SUCCESS" | "FAILURE";
  ipAddress: string;
  timestamp: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface FilterInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: "text" | "datetime-local" | "number";
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}

export default function AuditLogPage() {
  const token = Cookies.get("token");

  // --- حالات الفلترة ---
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("2025-01-01T00:00:00");
  const [toDate, setToDate] = useState("2026-01-02T23:59:59");
  
  // --- خيارات العمليات (Action Options) ---
  const actionOptions = [
    { label: "إنشاء شكوى", value: "CREATE_COMPLAINT" },
    { label: "تحديث شكوى", value: "UPDATE_COMPLAINT" },
    { label: "الرد على شكوى", value: "RESPOND_TO_COMPLAINT" },
    { label: "طلب معلومات إضافية", value: "REQUEST_ADDITIONAL_INFO" },
    { label: "تقديم معلومات إضافية", value: "PROVIDE_ADDITIONAL_INFO" },
    { label: "إلغاء طلب المعلومات", value: "CANCEL_INFO_REQUEST" },
    { label: "تسجيل رمز الإشعارات", value: "REGISTER_NOTIFICATION_TOKEN" },
    { label: "إلغاء رمز الإشعارات", value: "UNREGISTER_NOTIFICATION_TOKEN" },
    { label: "إرسال إشعار", value: "SEND_NOTIFICATION" },
    { label: "تسجيل دخول", value: "LOGIN" },
    { label: "دخول مواطن", value: "LOGIN_CITIZEN" },
    { label: "دخول موظف", value: "LOGIN_EMPLOYEE" },
    { label: "تسجيل مواطن جديد", value: "REGISTER_CITIZEN" },
    { label: "إنشاء مواطن", value: "CREATE_CITIZEN" },
    { label: "تحديث مواطن", value: "UPDATE_CITIZEN" },
    { label: "حذف مواطن", value: "DELETE_CITIZEN" },
    { label: "إنشاء موظف", value: "CREATE_EMPLOYEE" },
    { label: "تحديث موظف", value: "UPDATE_EMPLOYEE" },
    { label: "حذف موظف", value: "DELETE_EMPLOYEE" },
    { label: "تحديث صلاحيات المستخدم", value: "UPDATE_USER_PERMISSIONS" },
    { label: "إنشاء دور (Role)", value: "CREATE_ROLE" },
    { label: "تحديث دور (Role)", value: "UPDATE_ROLE" },
    { label: "حذف دور (Role)", value: "DELETE_ROLE" },
    { label: "تحديث صلاحيات الدور", value: "UPDATE_ROLE_PERMISSIONS" },
    { label: "تغيير كلمة المرور", value: "CHANGE_PASSWORD" },
    { label: "إعادة تعيين كلمة المرور", value: "RESET_PASSWORD" },
  ];

  // --- خيارات نوع الهدف (Target Type Options) ---
  const targetTypeOptions = [
    { label: "شكوى", value: "COMPLAINT" },
    { label: "طلب معلومات", value: "INFORMATION_REQUEST" },
    { label: "رمز إشعارات", value: "NOTIFICATION_TOKEN" },
    { label: "إشعار", value: "NOTIFICATION" },
    { label: "مستخدم", value: "USER" },
    { label: "مواطن", value: "CITIZEN" },
    { label: "موظف", value: "EMPLOYEE" },
    { label: "دور", value: "ROLE" },
  ];

  // --- حالات البيانات ---
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://89.116.236.10:3200/api/v1/admin/audit-log", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          userId: userId || undefined,
          action: action || undefined,
          targetType: targetType || undefined,
          status: status || undefined,
          fromDate,
          toDate,
          page,
          size: 20
        }
      });

      const { content, ...paginationInfo } = response.data;
      setLogs(content || []);
      setPagination(paginationInfo);
      
    } catch (error) {
      console.error("خطأ في جلب سجل التدقيق:", error);
      setLogs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [userId, action, targetType, status, fromDate, toDate, page, token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  console.log(logs);

  // --- دالة التصدير ---
  const handleExport = async () => {
    try {
      const baseUrl = "http://89.116.236.10:3200/api/v1/admin/audit-log/export";
      
      // تجهيز الباراميترات (Query Params)
      const queryParams = {
        format: "csv",
        userId: userId || undefined,
        action: action || undefined,
        targetType: targetType || undefined,
        status: status || undefined,
        fromDate,
        toDate,
        size: "1000"
      };

      // طلب الملف من السيرفر باستخدام axios لضمان إرسال التوكن
      const response = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
        responseType: 'blob', // مهم جداً لاستلام ملف
      });

      // إنشاء رابط مؤقت لتحميل الملف
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // تسمية الملف (مثلاً: audit-log-2025.csv)
      link.setAttribute('download', `audit-log-${new Date().getTime()}.csv`);
      
      document.body.appendChild(link);
      link.click();

      // تنظيف الرابط بعد التحميل
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("خطأ أثناء تصدير الملف:", error);
      alert("فشل تحميل الملف، يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans" dir="rtl">
      {/* الرأس */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
          <AiOutlineHistory size={30} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">سجل التدقيق (Audit Log)</h1>
          <p className="text-gray-500 text-sm font-medium">مراقبة وتتبع العمليات الإدارية والتقنية</p>
        </div>
      </div>

      {/* لوحة الفلاتر */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <FilterInput label="معرف المستخدم" value={userId} onChange={setUserId} placeholder="مثال: 4" />
        
        <FilterSelect 
          label="العملية" 
          value={action} 
          onChange={setAction} 
          options={actionOptions} 
        />

        <FilterSelect 
          label="نوع الهدف" 
          value={targetType} 
          onChange={setTargetType} 
          options={targetTypeOptions} 
        />

        <FilterSelect 
          label="الحالة" 
          value={status} 
          onChange={setStatus} 
          options={[{label: "نجاح", value: "SUCCESS"}, {label: "فشل", value: "FAILURE"}]} 
        />

        <FilterInput label="من تاريخ" type="datetime-local" value={fromDate} onChange={setFromDate} />
        <FilterInput label="إلى تاريخ" type="datetime-local" value={toDate} onChange={setToDate} />
        
        <div className="lg:col-span-2 flex gap-3">
            <button 
              onClick={() => { setPage(0); fetchLogs(); }}
              className="flex-1 bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <AiOutlineSearch size={20} /> تحديث السجل
            </button>

            <button 
              onClick={handleExport}
              className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <AiOutlineDownload size={20} /> تصدير CSV
            </button>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold animate-pulse tracking-wide">جاري سحب السجلات...</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold italic">لا توجد عمليات مسجلة بهذا الفلتر.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">التوقيت</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">المستخدم</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">العملية</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">الهدف</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-[11px] font-medium text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('ar-SY')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-700">{log.actorName}</div>
                      <div className="text-[10px] text-gray-400">#ID: {log.actorId}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-[11px] font-mono font-bold border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                        <div className="text-xs font-bold text-gray-600">{log.targetType}</div>
                        <div className="text-[10px] text-gray-400">ID: {log.targetId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {log.status === 'SUCCESS' ? 'مكتملة' : 'فاشلة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* الترقيم (Pagination) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 items-center mt-10">
          <button 
            disabled={!pagination.hasPrevious} 
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            السابق
          </button>
          
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-white w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm shadow-inner">
              {pagination.page + 1}
            </span>
            <span className="text-sm text-gray-400 font-bold">من {pagination.totalPages}</span>
          </div>

          <button 
            disabled={!pagination.hasNext} 
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

// --- المكونات المساعدة ---

function FilterInput({ label, value, onChange, placeholder, type = "text" }: FilterInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> {label}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-500 transition-all text-sm font-medium"
      />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> {label}
      </label>
      <select 
        value={value} 
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 outline-none text-sm font-bold text-gray-700 cursor-pointer focus:border-slate-500 transition-all appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center', backgroundSize: '1em' }}
      >
        <option value="">الكل</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}