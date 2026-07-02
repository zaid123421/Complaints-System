"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  filterComplaints,
  getComplaintByTracking,
  type Complaint,
} from "@/lib/api/complaints";
import {
  COMPLAINT_TYPES,
  COMPLAINT_STATUSES,
  PROVINCES,
  AGENCIES,
} from "@/constants/reference-data";

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
  const [governmentAgency, setGovernmentAgency] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<PaginationData | null>(null);

  const role = Cookies.get("role");

  const complaintTypes = [...COMPLAINT_TYPES];
  const statuses = [...COMPLAINT_STATUSES];
  const provinces = [...PROVINCES];
  const agencies = [...AGENCIES];

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      if (trackingNumber.trim()) {
        const data = await getComplaintByTracking(trackingNumber);
        setComplaints(data ? [data] : []);
        setPaginationInfo(null);
      } else {
        const res = await filterComplaints({
          page,
          size: 9,
          status: status || undefined,
          complaintType: complaintType || undefined,
          governorate: province || undefined,
          governmentAgency: governmentAgency || undefined,
        });

        setComplaints(res.content || []);

        if (res.totalPages !== undefined) {
          setPaginationInfo({
            totalPages: res.totalPages,
            totalElements: res.totalElements,
            page: res.page,
            hasNext: res.hasNext,
            hasPrevious: res.hasPrevious,
          });
        }
      }
    } catch {
      setComplaints([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [complaintType, status, province, governmentAgency, trackingNumber]);

  useEffect(() => {
    fetchComplaints();
  }, [complaintType, status, province, governmentAgency, page, trackingNumber]);

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "PENDING": return "bg-gray-100 text-gray-600";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-600";
      case "RESOLVED": return "bg-green-100 text-green-600";
      case "REJECTED": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="p-6 pl-12 w-full space-y-6">
      <h1 className="text-[32px] font-bold mb-6">إدارة الشكاوي</h1>

      {/* حقل البحث برقم التتبع (تمت إضافته كفلتر إضافي مستقل) */}
      <div className="mb-6 max-w-md">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> بحث برقم التتبع
          </label>
          <input 
            type="text"
            placeholder="مثال: SHK-20250215-AB12CD"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm"
          />
        </div>
      </div>

      {/* لاحظ التغيير في الـ className هنا */}
      <div className={`grid grid-cols-1 ${
        (mounted && role === 'PLATFORM_ADMIN') ? 'md:grid-cols-4' : 'md:grid-cols-3'
      } gap-4 mb-8`}>
        
        {/* العمود 1: نوع الشكوى */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> نوع الشكوى
          </label>
          <select 
            disabled={!!trackingNumber}
            value={complaintType} 
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">كل الأنواع</option>
            {complaintTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* العمود 2: حالة الشكوى */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> حالة الشكوى
          </label>
          <select 
            disabled={!!trackingNumber}
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">كل الحالات</option>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* العمود 3: المحافظة */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> المحافظة
          </label>
          <select 
            disabled={!!trackingNumber}
            value={province} 
            onChange={(e) => setProvince(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">كل المحافظات</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* العمود 4: الجهة الحكومية (يظهر فقط للآدمن بعد التحميل) */}
        {mounted && role === "PLATFORM_ADMIN" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> الجهة الحكومية
            </label>
            <select 
              disabled={!!trackingNumber}
              value={governmentAgency} 
              onChange={(e) => setGovernmentAgency(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
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
                  <span className="text-[11px] text-gray-300 font-mono">#{c.trackingNumber}</span>
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