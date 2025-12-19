"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { addEmployee, EmployeeForm } from "@/lib/api/employees";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

export default function AddEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState<EmployeeForm>({
    firstName: "",
    lastName: "",
    password: "",
    phoneNumber: "",
    dateOfHire: "",
    roleName: "",
    status: "",
    governmentAgencyType: "",
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showNotify = (msg: string, type: "success" | "error") => {
    setNotification({ msg, type });
    const duration = type === "success" ? 15000 : 4000;
    
    setTimeout(() => setNotification(null), duration);
  };

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

  const roles = ["SUPERVISOR", "VIEWER"];
  const statuses = ["ACTIVE", "INACTIVE"];

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.roleName) return showNotify("يرجى اختيار دور الموظف", "error");
    if (!form.status) return showNotify("يرجى اختيار حالة الموظف", "error");
    if (!form.governmentAgencyType) return showNotify("يرجى اختيار الجهة الحكومية", "error");
    if (!form.dateOfHire) return showNotify("يرجى تحديد تاريخ التوظيف", "error");

    setLoading(true);

    try {
      const data = await addEmployee(form);
      showNotify(`تم إضافة الموظف بنجاح! البريد: ${data.email}`, "success");
      
      setForm({
        firstName: "",
        lastName: "",
        password: "",
        phoneNumber: "",
        dateOfHire: "",
        roleName: "",
        status: "",
        governmentAgencyType: "",
      });
    } catch (err) {
      const error = err as Error;
      showNotify(error.message || "حدث خطأ أثناء الإضافة", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen relative">
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold text-white transition-all animate-bounce ${
          notification.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {notification.msg}
        </div>
      )}

      <div className="p-8 w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">
          إضافة موظف جديد
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-5 flex-col md:flex-row">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">الاسم الأول</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="ادخل الاسم الأول"
                className="w-full p-3 border-2 rounded-2xl border-gray-300 focus:outline-none focus:border-orange-500 bg-white"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">الاسم الأخير</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="ادخل الاسم الأخير"
                className="w-full p-3 border-2 rounded-2xl border-gray-300 focus:outline-none focus:border-orange-500 bg-white"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="ادخل كلمة المرور"
                className="w-full p-3 border-2 rounded-2xl border-gray-300 focus:outline-none focus:border-orange-500 bg-white"
                required
              />
            </div>
          </div>

          <div className="flex gap-5 flex-col md:flex-row">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">رقم الموبايل</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="ادخل رقم الموبايل"
                className="w-full p-3 border-2 rounded-2xl border-gray-300 focus:outline-none focus:border-orange-500 bg-white"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">تاريخ التوظيف</label>
              <input
                type="date"
                name="dateOfHire"
                value={form.dateOfHire}
                onChange={handleChange}
                className="w-full p-3 border-2 rounded-2xl border-gray-300 focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">دور الموظف</label>
              <Listbox value={form.roleName} onChange={(value) => setForm({ ...form, roleName: value })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border-2 border-gray-300 bg-white py-3 px-4 flex items-center justify-between focus:outline-none focus:border-orange-500">
                    <span className="mx-auto block truncate text-center">{form.roleName || "اختر الدور"}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role}
                          value={role}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                              active ? "bg-orange-100 text-orange-500" : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-semibold" : ""}`}>{role}</span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>

          <div className="flex gap-5 flex-col md:flex-row">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">حالة الموظف</label>
              <Listbox value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border-2 border-gray-300 bg-white py-3 px-4 flex items-center justify-between focus:outline-none focus:border-orange-500">
                    <span className="mx-auto block truncate text-center">{form.status || "اختر الحالة"}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {statuses.map((status) => (
                        <Listbox.Option
                          key={status}
                          value={status}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                              active ? "bg-orange-100 text-orange-500" : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-semibold" : ""}`}>{status}</span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">الجهة الحكومية</label>
              <Listbox value={form.governmentAgencyType} onChange={(value) => setForm({ ...form, governmentAgencyType: value })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border-2 border-gray-300 bg-white py-3 pr-3 pl-4 text-center focus:outline-none focus:border-orange-500">
                    <span className="block truncate">{form.governmentAgencyType || "اختر الجهة"}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {agencies.map((agency) => (
                        <Listbox.Option
                          key={agency}
                          value={agency}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                              active ? "bg-orange-100 text-orange-500" : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-semibold" : ""}`}>{agency}</span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-fit px-10 border-2 py-3 rounded-2xl transition cursor-pointer duration-500 mt-4 font-bold shadow-md ${
                loading
                  ? "bg-gray-300 border-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-orange-500 border-orange-500 text-white hover:bg-transparent hover:text-black shadow-orange-500/20"
              }`}
            >
              {loading ? "جارٍ الإرسال..." : "إضافة موظف"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}