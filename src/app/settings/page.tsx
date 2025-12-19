"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const router = useRouter();
  const token = Cookies.get("token");

  if (!token) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">الإعدادات</h1>
      <p className="text-gray-600 mb-6">
        هنا يمكنك تعديل إعدادات حسابك، لوحة التحكم، وتخصيص الموقع.
      </p>

      <div className="space-y-4 max-w-md">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-semibold mb-2">تغيير كلمة المرور</h2>
          <p className="text-gray-500 text-sm">يمكنك تحديث كلمة المرور الخاصة بك هنا.</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-semibold mb-2">الإشعارات</h2>
          <p className="text-gray-500 text-sm">تحكم في إعدادات الإشعارات للموقع.</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-semibold mb-2">اللغة والمنطقة</h2>
          <p className="text-gray-500 text-sm">يمكنك تغيير لغة العرض والمنطقة الزمنية.</p>
        </div>
      </div>
    </div>
  );
}
