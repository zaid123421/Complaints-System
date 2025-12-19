"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";

export interface Complaint {
  id: number;
  status: string;
  complaintType: string;
  governorate: string;
  governmentAgency: string;
  location: string;
  description: string;
  solutionSuggestion: string;
  response: string | null;
  respondedAt: string | null;
  respondedByName: string | null;
  attachments: string[];
  citizenId: number;
  citizenName: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface PaginationData {
  totalPages: number;
  totalElements: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function ComplaintsPage() {
  const [complaintType, setComplaintType] = useState("");
  const [status, setStatus] = useState("");
  const [province, setProvince] = useState("");
  const [governmentAgency, setGovernmentAgency] = useState(""); // الفلتر الجديد
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationData | null>(null);

  const token = Cookies.get("token");
  const role = Cookies.get("role"); // جلب الرتبة للتحقق من الصلاحية

  const complaintTypes = [
    "تأخر في إنجاز معاملة",
    "تعامل الموظف مقدم الخدمة",
    "تعطل النظام التقني",
    "تعقيد في الإجراءات",
    "رسوم الخدمة",
    "ضعف جودة الخدمة",
    "طول مدة الانتظار",
    "عدم الموافقة على الخدمة",
  ];

  const statuses = [
    { label: "قيد الانتظار", value: "PENDING" },
    { label: "قيد المعالجة", value: "IN_PROGRESS" },
    { label: "تم الحل", value: "RESOLVED" },
    { label: "مغلقة", value: "CLOSED" },
    { label: "مرفوضة", value: "REJECTED" },
  ];

  const provinces = ["دمشق", "ريف دمشق", "حلب", "حمص", "اللاذقية", "حماة", "طرطوس", "دير الزور", "الحسكة", "الرقة", "إدلب", "السويداء", "درعا", "القنيطرة"];

  const agencies = [
    "وزارة الإدارة المحلية والبيئة",
    "وزارة المالية",
    "وزارة الدفاع",
    "وزارة الاقتصاد والصناعة",
    "وزارة التعليم العالي",
    "وزارة الصحة",
    "وزارة التربية",
    "وزارة الطاقة",
    "أمانة رئاسة مجلس الوزراء",
    "وزارة الأشغال العامة والإسكان",
    "وزارة الاتصالات والتقانة",
    "وزارة الداخلية",
    "وزارة الزراعة",
    "وزارة الشؤون الاجتماعية والعمل",
    "وزارة الثقافة",
    "وزارة النقل",
    "وزارة العدل",
    "وزارة السياحة",
    "وزارة الإعلام",
    "وزارة الأوقاف",
    "نقابة المعلمين",
    "الاتحاد الرياضي العام",
    "الاتحاد العام للفلاحين",
    "مجلس الدولة",
    "وزارة التنمية الإدارية",
    "وزارة الخارجية والمغتربين",
    "وزارة الطوارئ والكوارث",
    "الهيئة العامة للمنافذ البرية والبحرية"
  ];
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // الاعتماد على رابط الفلترة بشكل أساسي كما في طلبك
      const finalUrl = "http://89.116.236.10:3200/api/v1/complaints/filter";

      const queryParams = {
        page: page,
        size: 9,
        status: status || undefined,
        complaintType: complaintType || undefined,
        governorate: province || undefined,
        governmentAgency: governmentAgency || undefined, // إرسال الجهة الحكومية للفلترة
      };

      const res = await axios.get(finalUrl, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        params: queryParams,
      });

      setComplaints(res.data.content || res.data || []);
      
      if (res.data.totalPages !== undefined) {
        setPaginationInfo({
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
          page: res.data.page,
          hasNext: res.data.hasNext,
          hasPrevious: res.data.hasPrevious
        });
      }

    } catch (err) {
      console.error("فشل جلب الشكاوي:", err);
      setComplaints([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // تصفير الصفحة عند تغيير أي فلتر بما في ذلك الجهة الحكومية
  useEffect(() => {
    setPage(0);
  }, [complaintType, status, province, governmentAgency]);

  useEffect(() => {
    fetchComplaints();
  }, [complaintType, status, province, governmentAgency, page]);

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-gray-100 text-gray-600";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-600";
      case "RESOLVED": return "bg-green-100 text-green-600";
      case "REJECTED": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 pl-12 w-full space-y-6">
      <h1 className="text-[32px] font-bold mb-6">إدارة الشكاوي</h1>

      {/* Filters Section */}
      <div className={`grid grid-cols-1 ${role === 'PLATFORM_ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-8`}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> نوع الشكوى
          </label>
          <select 
            value={complaintType} 
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">كل الأنواع</option>
            {complaintTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> حالة الشكوى
          </label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">كل الحالات</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> المحافظة
          </label>
          <select 
            value={province} 
            onChange={(e) => setProvince(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">كل المحافظات</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* الفلتر الرابع للـ PLATFORM_ADMIN فقط */}
        {role === "PLATFORM_ADMIN" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> الجهة الحكومية
            </label>
            <select 
              value={governmentAgency} 
              onChange={(e) => setGovernmentAgency(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">كل الجهات</option>
              {agencies.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-bold">لا توجد شكاوي مطابقة للبحث حالياً.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex justify-between gap-5 items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold text-center ${getStatusStyle(c.status)}`}>
                      {c.status === "IN PROGRESS"
                      ? "قيد المعالجة"
                      : (statuses.find(s => s.value === c.status)?.label || c.status)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{c.createdAt?.split('T')[0]}</span>
                  </div>

                  <h2 className="font-bold text-gray-800 mb-3 line-clamp-1">{c.complaintType}</h2>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">📍</span> {c.governorate} - {c.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">🏛️</span> {c.governmentAgency}
                    </p>
                    <p className="flex items-center gap-2 font-medium text-orange-600">
                      <span className="text-gray-400 text-xs">👤</span> {c.citizenName}
                    </p>
                  </div>

                  {c.attachments && c.attachments.length > 0 && (
                    <div className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold mb-3">
                      📎 يحتوي مرفقات
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <Link 
                    href={`/complaints/${c.id}`} 
                    className="text-orange-500 font-bold text-sm hover:underline flex items-center gap-1"
                  >
                    التفاصيل 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <span className="text-[11px] text-gray-300 font-mono">#{c.id}</span>
                </div>
              </div>
            ))}
          </div>

          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="flex justify-center gap-4 items-center mt-10">
              <button 
                disabled={!paginationInfo.hasPrevious} 
                onClick={() => setPage((p) => p - 1)} 
                className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 font-bold transition-all active:scale-95 shadow-sm"
              >
                السابق
              </button>
              
              <span className="text-gray-600 font-medium">
                صفحة <span className="text-orange-500 font-bold">{page + 1}</span> من {paginationInfo.totalPages}
              </span>
              
              <button 
                disabled={!paginationInfo.hasNext} 
                onClick={() => setPage((p) => p + 1)} 
                className="px-6 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 font-bold transition-all active:scale-95 shadow-sm"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}