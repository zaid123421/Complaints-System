"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  ReportData,
  StatusResponse,
  AvgResolutionTimeResponse,
  ExportFormat,
} from "@/types/reports";
import {
  getComplaintTypeDistribution,
  getComplaintStatus,
  getAverageResolutionTime,
  exportReport,
} from "@/lib/api/reports";

interface FilterBarProps {
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  exportFormat: ExportFormat;
  setExportFormat: (val: ExportFormat) => void;
  onUpdate: () => void;
  onExport: () => void;
  accentColor: string;
  btnColor: string;
}

export default function ReportsPage() {
  const [distFromDate, setDistFromDate] = useState("2025-01-01");
  const [distToDate, setDistToDate] = useState("2025-12-31");
  const [distExportFormat, setDistExportFormat] = useState<ExportFormat>("csv");
  const [distData, setDistData] = useState<ReportData | null>(null);
  const [distLoading, setDistLoading] = useState(false);

  const [statusFromDate, setStatusFromDate] = useState("2025-01-01");
  const [statusToDate, setStatusToDate] = useState("2025-12-31");
  const [statusExportFormat, setStatusExportFormat] = useState<ExportFormat>("csv");
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [avgFromDate, setAvgFromDate] = useState("2025-01-01");
  const [avgToDate, setAvgToDate] = useState("2025-12-31");
  const [avgExportFormat, setAvgExportFormat] = useState<ExportFormat>("csv");
  const [avgData, setAvgData] = useState<AvgResolutionTimeResponse | null>(null);
  const [avgLoading, setAvgLoading] = useState(false);


  const fetchDistData = useCallback(async () => {
    setDistLoading(true);
    try {
      setDistData(await getComplaintTypeDistribution(distFromDate, distToDate));
    } catch {
      // ignore
    } finally {
      setDistLoading(false);
    }
  }, [distFromDate, distToDate]);

  const fetchStatusData = useCallback(async () => {
    setStatusLoading(true);
    try {
      setStatusData(await getComplaintStatus(statusFromDate, statusToDate));
    } catch {
      // ignore
    } finally {
      setStatusLoading(false);
    }
  }, [statusFromDate, statusToDate]);

  const fetchAvgData = useCallback(async () => {
    setAvgLoading(true);
    try {
      setAvgData(await getAverageResolutionTime(avgFromDate, avgToDate));
    } catch {
      // ignore
    } finally {
      setAvgLoading(false);
    }
  }, [avgFromDate, avgToDate]);

  useEffect(() => {
    fetchDistData();
    fetchStatusData();
    fetchAvgData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleExport = async (type: "dist" | "status" | "avg") => {
    let from: string, to: string, agency: string | undefined, endpoint: string, format: ExportFormat;
    if (type === "dist") {
      from = distFromDate;
      to = distToDate;
      agency = distData?.agency;
      endpoint = "complaint-type-distribution";
      format = distExportFormat;
    } else if (type === "status") {
      from = statusFromDate;
      to = statusToDate;
      agency = statusData?.agency;
      endpoint = "complaint-status";
      format = statusExportFormat;
    } else {
      from = avgFromDate;
      to = avgToDate;
      agency = avgData?.agency;
      endpoint = "average-resolution-time";
      format = avgExportFormat;
    }

    try {
      const blob = await exportReport(endpoint, {
        format,
        fromDate: from,
        toDate: to,
        agency: agency || "",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `تقرير-${endpoint}.${format}`;
      link.click();
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans space-y-12" dir="rtl">
      <header className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center md:text-right">
        <h1 className="text-3xl font-black text-gray-900 mb-2">مركز التقارير والتحليلات</h1>
        <p className="text-gray-500 font-medium">نظام مراقبة الأداء الاستراتيجي ومعالجة الشكاوى</p>
      </header>

      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <SectionHeader title="تقرير توزيع أنواع الشكاوى" color="bg-blue-600" />
        <FilterBar 
          fromDate={distFromDate} setFromDate={setDistFromDate} 
          toDate={distToDate} setToDate={setDistToDate} 
          exportFormat={distExportFormat} setExportFormat={setDistExportFormat}
          onUpdate={fetchDistData} onExport={() => handleExport('dist')} 
          accentColor="focus:ring-blue-500" btnColor="bg-blue-600"
        />
        {distLoading ? <LoadingSpinner color="text-blue-500" /> : distData && (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-right bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-gray-600 font-bold">النوع</th>
                  <th className="p-4 text-center text-gray-600 font-bold">العدد</th>
                  <th className="p-4 text-gray-600 font-bold">النسبة المئوية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {distData.distribution.map((item, i) => (
                  <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 font-semibold text-gray-700">{item.type}</td>
                    <td className="p-4 text-center"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">{item.count}</span></td>
                    <td className="p-4"><ProgressBar percentage={item.percentage} color="bg-blue-500" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <SectionHeader title="تحليل حالات المعالجة" color="bg-purple-600" />
        <FilterBar 
          fromDate={statusFromDate} setFromDate={setStatusFromDate} 
          toDate={statusToDate} setToDate={setStatusToDate} 
          exportFormat={statusExportFormat} setExportFormat={setStatusExportFormat}
          onUpdate={fetchStatusData} onExport={() => handleExport('status')} 
          accentColor="focus:ring-purple-500" btnColor="bg-purple-600"
        />
        {statusLoading ? <LoadingSpinner color="text-purple-500" /> : statusData && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatusCard label="إجمالي الشكاوى" count={statusData.totalComplaints} color="bg-gray-800" />
            <StatusCard label="قيد المعالجة" count={statusData.inProgressCount} color="bg-blue-500" />
            <StatusCard label="بانتظار المراجعة" count={statusData.pendingCount} color="bg-amber-500" />
            <StatusCard label="تم الحل" count={statusData.resolvedCount} color="bg-green-500" />
            <StatusCard label="مرفوضة" count={statusData.rejectedCount} color="bg-red-500" />
            <StatusCard label="مغلقة" count={statusData.closedCount} color="bg-indigo-500" />
          </div>
        )}
      </section>

      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <SectionHeader title="مؤشرات سرعة الاستجابة" color="bg-emerald-600" />
        <FilterBar 
          fromDate={avgFromDate} setFromDate={setAvgFromDate} 
          toDate={avgToDate} setToDate={setAvgToDate} 
          exportFormat={avgExportFormat} setExportFormat={setAvgExportFormat}
          onUpdate={fetchAvgData} onExport={() => handleExport('avg')} 
          accentColor="focus:ring-emerald-500" btnColor="bg-emerald-600"
        />
        {avgLoading ? <LoadingSpinner color="text-emerald-500" /> : avgData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TimeCard label="متوسط الأيام" value={avgData.averageDays} unit="يوم" color="text-emerald-600" />
              <TimeCard label="متوسط الساعات" value={avgData.averageHours} unit="ساعة" color="text-blue-600" />
              <TimeCard label="أسرع حل" value={avgData.minResolutionDays} unit="يوم" color="text-orange-600" />
              <TimeCard label="أبطأ حل" value={avgData.maxResolutionDays} unit="يوم" color="text-red-600" />
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center shadow-inner">
              <span className="text-gray-600 font-bold text-sm">إجمالي الشكاوى المنجزة في الفترة المختارة:</span>
              <span className="text-2xl font-black text-gray-800">{avgData.totalResolvedComplaints} <span className="text-xs text-gray-400">شكوى</span></span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-2 h-8 ${color} rounded-full shadow-sm`}></div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function FilterBar({ fromDate, setFromDate, toDate, setToDate, exportFormat, setExportFormat, onUpdate, onExport, accentColor, btnColor }: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100 items-end shadow-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 mr-2">من تاريخ</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={`p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 ${accentColor} bg-white transition-all`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 mr-2">إلى تاريخ</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={`p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 ${accentColor} bg-white transition-all`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-400 mr-2">صيغة التصدير</label>
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as ExportFormat)} className="p-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500">
          <option value="csv">Excel (CSV)</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      <button onClick={onUpdate} className={`${btnColor} text-white font-bold py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md`}>تحديث البيانات</button>
      <button onClick={onExport} className="bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md">تصدير التقرير</button>
    </div>
  );
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col items-center text-center hover:scale-105 transition-transform">
      <span className={`w-3 h-3 rounded-full ${color} mb-3 shadow-sm`}></span>
      <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-800">{count}</p>
    </div>
  );
}

function TimeCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl text-center shadow-sm hover:border-emerald-200 transition-colors">
      <p className="text-gray-400 text-[10px] font-bold mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline justify-center gap-1">
        <span className={`text-3xl font-black ${color}`}>{value}</span>
        <span className="text-xs font-bold text-gray-300">{unit}</span>
      </div>
    </div>
  );
}

function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-xs font-bold text-gray-400 w-8">{percentage}%</span>
    </div>
  );
}

function LoadingSpinner({ color }: { color: string }) {
  return <div className={`text-center py-12 ${color} font-bold animate-pulse text-sm`}>جاري معالجة طلبك واستخراج البيانات...</div>;
}