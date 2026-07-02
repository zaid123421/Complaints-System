"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineHistory, AiOutlineHome, AiOutlineLogout } from "react-icons/ai";
import { FiUsers, FiSettings, FiFileText } from "react-icons/fi";
import Cookies from "js-cookie";
import { hasPermission } from "@/lib/hasPermission";
import { Role } from "@/lib/permissions";
import { logout } from "@/lib/api/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const cookieRole = Cookies.get("role") as Role | undefined;
    setRole(cookieRole ?? null);
  }, []);

  const normalizePath = (path: string) => path.replace(/\/$/, "");

  const linkClasses = (href: string) =>
    `flex items-center gap-3 justify-center sm:justify-start p-2 rounded transition-colors duration-150 ${
      normalizePath(pathname) === normalizePath(href)
        ? "text-orange-500 font-semibold"
        : "text-black hover:text-orange-500"
    }`;

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      const token = Cookies.get("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      await logout();

      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("firstName");
      Cookies.remove("lastName");
      router.replace("/login");
    } catch {
      // ignore
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 h-screen bg-white shadow-xl flex flex-col justify-between items-center sm:items-start sm:w-64 w-16 p-3 sm:p-5"
      dir="ltr"
    >
      <div className="w-full">
        {/* Logo */}
        <div className="flex justify-center items-center gap-5 sm:justify-start mb-10">
          <RxDashboard size={24} className="text-orange-500" />
          <h2 className="text-xl font-extrabold text-orange-500 hidden sm:block">
            لوحة التحكم
          </h2>
        </div>

        {/* Navigation */}
        <ul className="flex flex-col gap-4 w-full mt-5">
          {/* الرئيسية */}
          {role === "PLATFORM_ADMIN" && (
            <li>
              <Link
                href="/dashboard"
                className={linkClasses("/dashboard")}
              >
                <AiOutlineHome size={20} />
                <span className="hidden sm:inline">الرئيسية</span>
              </Link>
            </li>
          )}

          {/* المستخدمين */}
          {role && hasPermission("createUsers") && (
            <li>
              <Link href="/users" className={linkClasses("/users")}>
                <FiUsers size={20} />
                <span className="hidden sm:inline">المستخدمين</span>
              </Link>
            </li>
          )}

          {/* الشكاوي */}
          {role && (
            <li>
              <Link href="/complaints" className={linkClasses("/complaints")}>
                <FiFileText size={20} />
                <span className="hidden sm:inline">الشكاوي</span>
              </Link>
            </li>
          )}

          {/* التقارير */}
          {role && hasPermission("generateReports") && (
            <li>
              <Link href="/reports" className={linkClasses("/reports")}>
                <FiFileText size={20} />
                <span className="hidden sm:inline">التقارير</span>
              </Link>
            </li>
          )}

          {role === "PLATFORM_ADMIN" && (
            <li>
              <Link
                href="/audit-logs"
                className={linkClasses("/audit-logs")}
              >
                <AiOutlineHistory size={20} />
                <span className="hidden sm:inline">سجل التدقيق</span>
              </Link>
            </li>
          )}

          {/* الإعدادات */}
          {/* <li>
            <Link href="/settings" className={linkClasses("/settings")}>
              <FiSettings size={20} />
              <span className="hidden sm:inline">الإعدادات</span>
            </Link>
          </li> */}
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="flex items-center gap-3 justify-center sm:justify-start p-2 rounded transition-colors duration-150 text-black hover:text-orange-500 w-full mt-5 disabled:opacity-50"
      >
        <AiOutlineLogout size={20} />
        <span className="hidden sm:inline">
          {logoutLoading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </span>
      </button>
    </div>
  );
}