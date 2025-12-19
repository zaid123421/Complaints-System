"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TopAgency {
  agencyName: string;
  agencyLabel: string;
  complaintCount: number;
}

interface TopComplaintType {
  typeName: string;
  typeLabel: string;
  complaintCount: number;
}

interface DashboardData {
  totalComplaints: number;
  resolvedComplaints: number;
  openComplaints: number;
  overdueComplaints: number;
  averageResolutionTimeDays: number;
  averageResolutionTimeHours: number;
  topAgenciesByComplaints: TopAgency[];
  topComplaintTypes: TopComplaintType[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [overdueDaysThreshold, setOverdueDaysThreshold] = useState(30);

  const [exportFormat, setExportFormat] = useState<"pdf">("pdf");

  const COLORS = [
    "#F59E0B",
    "#0cbe4dff",
    "#DC2626",
    "#00ccdbff",
    "#2563EB",
    "#7C3AED",
  ];

  const fetchDashboard = async () => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const params = new URLSearchParams();
    console.log(from);
    console.log(to);
    console.log(overdueDaysThreshold);
    if (from) params.append("fromDate", from);
    if (to) params.append("toDate", to);
    if (overdueDaysThreshold)
      params.append(
        "overdueDaysThreshold",
        overdueDaysThreshold.toString()
      );

    const res = await fetch(
      `http://89.116.236.10:3200/api/v1/admin/dashboard/overview?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await res.json();
    setData(json);
  };

  const exportReport = async () => {
  const token = Cookies.get("token");
  if (!token) {
    router.replace("/login");
    return;
  }

  const params = new URLSearchParams();

  params.append("format", exportFormat);
  if (from) params.append("fromDate", from);
  if (to) params.append("toDate", to);
  if (overdueDaysThreshold)
    params.append(
      "overdueDaysThreshold",
      overdueDaysThreshold.toString()
    );

  const res = await fetch(
    `http://89.116.236.10:3200/api/v1/admin/dashboard/export?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    alert("فشل تصدير التقرير");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard-report.${exportFormat === "pdf" ? "pdf" : "xlsx"}`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};


  useEffect(() => {
    const loadData = async () => {
      setLoading(false);
      fetchDashboard();
    };
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    } else {
      loadData();
    }
  }, []);

  if (loading) return null;

  return (
    <div className="p-12 md:p-6 space-y-6">
      <h1 className="font-bold text-[32px]">تقارير وإحصائيات</h1>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl mb-8">
        <div className="flex flex-wrap gap-6 items-end">
          
          {/* من تاريخ */}
          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              من تاريخ
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
            />
          </div>

          {/* إلى تاريخ */}
          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              إلى تاريخ
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
            />
          </div>

          {/* عدد أيام التأخير */}
          <div className="flex flex-col gap-2 w-40">
            <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              أيام التأخير
            </label>
            <input
              type="number"
              min={1}
              value={overdueDaysThreshold}
              onChange={(e) => setOverdueDaysThreshold(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 text-center"
            />
          </div>

          {/* زر تطبيق الفلترة */}
          <button
            onClick={fetchDashboard}
            className="bg-gray-800 hover:bg-black text-white font-bold px-10 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            تطبيق الفلترة
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white shadow rounded-xl p-4 border-r-4 border-blue-500">
            <p className="text-sm text-gray-500">إجمالي الشكاوي</p>
            <p className="text-2xl font-bold">{data.totalComplaints}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-4 border-r-4 border-yellow-500">
            <p className="text-sm text-gray-500">الشكاوي المفتوحة</p>
            <p className="text-2xl font-bold">{data.openComplaints}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-4 border-r-4 border-green-500">
            <p className="text-sm text-gray-500">المحلولة</p>
            <p className="text-2xl font-bold">{data.resolvedComplaints}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-4 border-r-4 border-red-500">
            <p className="text-sm text-gray-500">المتأخرة</p>
            <p className="text-2xl font-bold">{data.overdueComplaints}</p>
      </div>

        <div className="bg-white shadow rounded-xl p-4 border-r-4 border-purple-500">
          <p className="text-sm text-gray-500">متوسط وقت الحل</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-700">
              {data.averageResolutionTimeDays}
            </span>
            <span className="text-xs text-gray-400">يوم</span>
            <span className="mx-1 text-gray-300">|</span>
            <span className="text-2xl font-bold text-purple-700">
              {data.averageResolutionTimeHours}
            </span>
            <span className="text-xs text-gray-400">ساعة</span>
          </div>
        </div>
      </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الشكاوي حسب الوزارة */}
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="font-bold mb-4">الشكاوي حسب الوزارة</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.topAgenciesByComplaints.map((item) => ({
                  name: item.agencyLabel,
                  value: item.complaintCount,
                }))}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* أنواع الشكاوي */}
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="font-bold mb-4">أنواع الشكاوي</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.topComplaintTypes.map((item) => ({
                    name: item.typeLabel,
                    value: item.complaintCount,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {data.topComplaintTypes.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
          <h3 className="font-bold text-2xl text-gray-800">تصدير التقارير</h3>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
            <h3 className="font-bold text-2xl text-gray-800">تصدير التقارير</h3>
          </div>

          <div className="flex flex-wrap gap-6 items-end">
            {/* من تاريخ */}
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                من تاريخ
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
              />
            </div>

            {/* إلى تاريخ */}
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                إلى تاريخ
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700"
              />
            </div>

            {/* عدد أيام التأخير */}
            <div className="flex flex-col gap-2 w-32">
              <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                أيام التأخير
              </label>
              <input
                type="number"
                min={1}
                value={overdueDaysThreshold}
                onChange={(e) => setOverdueDaysThreshold(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 text-center"
              />
            </div>

            {/* صيغة التقرير */}
            <div className="flex flex-col gap-2 w-32">
              <label className="text-sm font-semibold text-gray-600 mr-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                الصيغة
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "pdf")}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 appearance-none cursor-pointer"
              >
                <option value="pdf">PDF</option>
              </select>
            </div>

            {/* زر التصدير */}
            <button
              onClick={exportReport}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تصدير التقرير
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
