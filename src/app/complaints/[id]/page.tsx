"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

/* ===================== Types ===================== */

interface Attachment {
  id: number;
  originalFilename: string;
  downloadUrl: string;
}

interface HistoryItem {
  id: number;
  actionType: string;
  actionDescription: string;
  actorId: number;
  actorName: string;
  actorEmail: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

interface InfoRequest {
  id: number;
  complaintId: number;
  requestedBy: {
    id: number;
    name: string;
    email: string;
  };
  requestMessage: string;
  status: string;
  requestedAt: string;
  respondedAt: string | null;
  responseMessage: string | null;
  attachments: Attachment[];
}

type ComplaintStatus =
  | "PENDING"
  | "IN PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

interface Complaint {
  id: number;
  status: ComplaintStatus;
  complaintType: string;
  governorate: string;
  governmentAgency: string;
  location: string;
  description: string;
  response: string | null;
  attachments: Attachment[];
}

/* ===================== Component ===================== */

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);
  const [newRequestMessage, setNewRequestMessage] = useState("");
  const [isSendingInfo, setIsSendingInfo] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState<ComplaintStatus>("PENDING");
  const [originalResponse, setOriginalResponse] = useState("");
  const [originalStatus, setOriginalStatus] = useState<ComplaintStatus>("PENDING");

  const [historyPage, setHistoryPage] = useState(0);
  const [historySize, setHistorySize] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = Cookies.get("token");
  const role = Cookies.get("role");
  const isPlatformAdmin = role === "PLATFORM_ADMIN";

  const fetchHistory = useCallback(async (page = historyPage) => {
    if (!token || !id) return;
    try {
      setHistoryLoading(true);
      const res = await axios.get(
        `http://89.116.236.10:3200/api/v1/complaints/${id}/history`,
        {
          params: { page, size: historySize },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(res.data.content ?? []);
      setHistoryPage(res.data.page);
      setHistoryTotalPages(res.data.totalPages);
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [id, token, historyPage, historySize]);

  const fetchInfoRequests = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `http://89.116.236.10:3200/api/v1/complaints/${id}/info-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfoRequests(res.data.content || []);
    } catch (err) {
      console.error("فشل جلب طلبات المعلومات:", err);
    }
  }, [id, token]);

  const fetchComplaint = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `http://89.116.236.10:3200/api/v1/complaints/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(res.data);
      setResponseText(res.data.response || "");
      setStatus(res.data.status);
      setOriginalResponse(res.data.response || "");
      setOriginalStatus(res.data.status);
    } catch (err) {
      console.error("فشل جلب الشكوى:", err);
    }
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    const loadData = async () => {
      await fetchComplaint();
      await fetchHistory();
      await fetchInfoRequests();
    };
    loadData();
  }, [id, token, fetchComplaint, fetchHistory, fetchInfoRequests, router]);

  /* ===================== Actions ===================== */

  const handleSendInfoRequest = async () => {
    if (!newRequestMessage.trim() || !token) return;
    setIsSendingInfo(true);
    try {
      await axios.post(
        `http://89.116.236.10:3200/api/v1/complaints/${id}/info-requests`,
        { message: newRequestMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("تم إرسال طلب المعلومة للمواطن بنجاح");
      setNewRequestMessage("");
      await fetchInfoRequests(); 
      await fetchHistory(0); 
    } catch (err) {
      alert("فشل إرسال الطلب");
    } finally {
      setIsSendingInfo(false);
    }
  };

  const handleUpdate = async () => {
    if (isPlatformAdmin) return;
    if (!responseText.trim()) {
      alert("يجب كتابة الرد قبل تحديث الشكوى");
      return;
    }
    try {
      await axios.put(
        `http://89.116.236.10:3200/api/v1/complaints/${id}/respond`,
        null,
        {
          params: { status, response: responseText },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("تم تحديث الشكوى بنجاح");
      await fetchComplaint();
      await fetchHistory(0);
    } catch (err) {
      alert("فشل تحديث الشكوى");
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    if (!token) return;
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      alert("فشل تحميل الملف");
    }
  };

  if (!complaint) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p className="text-gray-500 text-lg">⏳ جاري تحميل الشكوى...</p>
      </div>
    );
  }

  const isModified = responseText.trim() !== (originalResponse?.trim() || "") || status !== originalStatus;

  return (
    <div className="flex-1 w-full min-h-screen bg-white md:bg-gray-50/30 overflow-x-hidden">
      <div className="max-w-5xl mx-auto p-4 md:p-10 flex flex-col gap-6">
        
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-r-4 border-orange-500 pr-3">تفاصيل الشكوى</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
            <p><strong className="text-gray-600">نوع الشكوى:</strong> {complaint.complaintType}</p>
            <p><strong className="text-gray-600">المحافظة:</strong> {complaint.governorate}</p>
            <p><strong className="text-gray-600">الجهة:</strong> {complaint.governmentAgency}</p>
            <p><strong className="text-gray-600">الموقع:</strong> {complaint.location}</p>
          </div>
          <div className="mt-4">
            <p className="text-gray-600 font-bold mb-1">الوصف:</p>
            <p className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic">{complaint.description}</p>
          </div>

          <div className="mt-6 max-w-xs">
            <label className="font-bold text-gray-700 block mb-2">الحالة الحالية</label>
            <select
              value={status}
              disabled={isPlatformAdmin}
              onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 shadow-sm appearance-none cursor-pointer ${isPlatformAdmin ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
            >
              {["PENDING", "IN PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {isPlatformAdmin && <p className="text-[10px] text-orange-600 mt-1 font-bold">للعرض فقط (مسؤول منصة)</p>}
          </div>
        </section>

        {/* Attachments Section */}
        {complaint.attachments.length > 0 && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">📎 المرفقات الأساسية</h2>
            <div className="flex flex-wrap gap-3">
              {complaint.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 max-w-full">
                  <span className="text-xs md:text-sm truncate max-w-[120px] sm:max-w-[200px]">{att.originalFilename}</span>
                  <button
                    onClick={() => handleDownload(`http://89.116.236.10:3200/api/v1/complaints/${complaint.id}/attachments/${att.id}`, att.originalFilename)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs shrink-0"
                  >
                    تحميل
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Info Requests Section */}
        <section className="bg-blue-50/50 p-4 md:p-6 rounded-2xl border border-blue-100 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 text-blue-800">طلب معلومات من المواطن</h2>
          
          <div className="space-y-4 mb-6">
            {infoRequests.length === 0 ? (
              <p className="text-gray-400 italic text-sm">لا توجد مراسلات سابقة.</p>
            ) : (
              infoRequests.map((req) => (
                <div key={req.id} className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-3 text-[10px] border-b pb-2">
                    <span className={`font-bold px-2 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {req.status === 'PENDING' ? 'بانتظار الرد' : 'تم الرد'}
                    </span>
                    <span className="text-gray-400 font-medium">{new Date(req.requestedAt).toLocaleString("ar-SY")}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed"><strong>الطلب:</strong> {req.requestMessage}</p>

                  {req.responseMessage && (
                    <div className="mt-4 p-3 bg-green-50 rounded-xl border-r-4 border-green-500">
                      <p className="text-sm text-green-800 leading-relaxed"><strong>رد المواطن:</strong> {req.responseMessage}</p>
                      {req.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
                          {req.attachments.map(att => (
                            <button 
                              key={att.id}
                              onClick={() => handleDownload(`http://89.116.236.10:3200/api/v1/complaints/${id}/attachments/${att.id}`, att.originalFilename)}
                              className="text-[10px] bg-white border border-green-200 text-green-700 px-2 py-1 rounded-md hover:bg-green-100 transition-colors"
                            >
                              📎 {att.originalFilename}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {!isPlatformAdmin && (
            <div className="flex flex-col gap-3">
              <textarea
                value={newRequestMessage}
                onChange={(e) => setNewRequestMessage(e.target.value)}
                placeholder="اكتب ما تحتاجه من المواطن هنا..."
                className="p-4 border border-blue-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-24 text-sm resize-none shadow-inner bg-white"
              />
              <button
                onClick={handleSendInfoRequest}
                disabled={isSendingInfo || !newRequestMessage.trim()}
                className="md:self-end bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-all font-bold shadow-md active:scale-95 w-full md:w-auto"
              >
                {isSendingInfo ? "جاري الإرسال..." : "إرسال طلب المعلومة"}
              </button>
            </div>
          )}
        </section>

        {/* Final Response Section */}
        {!isPlatformAdmin && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-3 text-lg">ملاحظات الشكوى</h2>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="resize-none p-4 w-full rounded-2xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all min-h-[120px] mb-4 text-sm"
              placeholder="اكتب الرد الرسمي والنهائي للمواطن..."
            />
            <button
              onClick={handleUpdate}
              disabled={!isModified || !responseText.trim()}
              className={`w-full md:w-auto px-10 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isModified && responseText.trim() ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-orange-200" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              حفظ وتحديث الحالة
            </button>
          </section>
        )}

        {/* History Section */}
        <section className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-200 mb-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-r-4 border-gray-400 pr-3">سجل المتابعة</h2>
          
          {historyLoading && history.length === 0 ? (
            <p className="text-center py-4">جاري تحميل السجل...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400 text-center py-4 italic">لا يوجد سجل حركات حالياً.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-gray-300"></div>
                  <p className="font-bold text-gray-800 text-sm mb-2">{item.actionDescription}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span>👤 <strong className="text-gray-700">المنفذ:</strong> {item.actorName}</span>
                    <span>📅 {new Date(item.createdAt).toLocaleString("ar-SY")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
            <button 
              onClick={() => setHistoryPage(p => Math.max(p - 1, 0))} 
              disabled={historyPage === 0 || historyLoading} 
              className="w-full md:w-auto px-6 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm font-bold shadow-sm"
            >
              السابق
            </button>
            <span className="text-xs text-gray-500 font-bold bg-gray-200 px-4 py-1.5 rounded-full">
              صفحة {historyPage + 1} من {historyTotalPages}
            </span>
            <button 
              onClick={() => setHistoryPage(p => p + 1 < historyTotalPages ? p + 1 : p)} 
              disabled={historyPage + 1 >= historyTotalPages || historyLoading} 
              className="w-full md:w-auto px-6 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm font-bold shadow-sm"
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}