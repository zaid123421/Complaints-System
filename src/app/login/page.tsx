"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Image from "next/image";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { adminLogin, employeeLogin } from "@/lib/api/auth";
import { AxiosError } from "axios";
import Spinner from "../components/Spinner";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "بريد إالكتروني خاطئ" }),
  password: z.string().min(8, { message: "كلمة المرور يجب ألا تقل عن 8 أحرف" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const [loginType, setLoginType] = useState<"admin" | "employee">("admin");

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      console.log(loginType);
      console.log(data);
      let res;
      if (loginType === "admin") {
        res = await adminLogin(data);
        console.log("loginType")
      } else {
        res = await employeeLogin(data);
        console.log("loginType")
      }

      if (res?.token) {
        Cookies.set("token", res.token, { path: "/" });
        Cookies.set("role", res.role, { path: "/" });
        
        Cookies.set("firstName", res.firstName, { path: "/" });
        Cookies.set("lastName", res.lastName, { path: "/" });
        router.push(loginType === "admin" ? "/dashboard" : "/employee/dashboard");
      } else {
        alert("خطأ في تسجيل الدخول");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      alert("فشل تسجيل الدخول: " + (error.response?.data?.message || "حدث خطأ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative lg:flex lg:h-screen w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-orange-600 to-yellow-600 rounded-l-full justify-center items-center h-full justify-self-start">
        <span className="text-white font-bold text-2xl text-4xl pr-10 text-center leading-[1.7]">
          مرحبا بك
          في إدارة منصة الشكاوي
        </span>
      </div>

      <div className="flex justify-center items-center w-full lg:w-1/2 h-screen p-6">
        <div className="w-[400px] h-[500px] flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/Images/lock.svg"
              alt="Lock Icon"
              width={100}
              height={100}
            />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-center">تسجيل الدخول</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative mb-4">
              <label className="block mb-3 text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ادخل بريدك الالكتروني"
                  className={`peer w-full pl-10 p-2 border-[2px] rounded-2xl focus:outline-none focus:border-orange-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("email")}
                />
                <span
                  className={`absolute inset-y-0 left-3 flex items-center transition-colors duration-300 ${
                    errors.email
                      ? "text-red-500"
                      : "peer-focus:text-orange-500 text-gray-400"
                  }`}
                >
                  <AiOutlineMail size={20} />
                </span>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative mt-3">
              <label className="block mb-3 text-sm font-medium">كلمة السر</label>
              <div className="relative">
                <input
                  placeholder="ادخل كلمة المرور"
                  type="password"
                  className={`peer w-full pl-10 p-2 border-[2px] rounded-2xl focus:outline-none focus:border-orange-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("password")}
                />
                <span
                  className={`absolute inset-y-0 left-3 flex items-center transition-colors duration-300 ${
                    errors.password
                      ? "text-red-500"
                      : "peer-focus:text-orange-500 text-gray-400"
                  }`}
                >
                  <AiOutlineLock size={20} />
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 border-2 border-orange-500
            text-white py-2 rounded-2xl hover:bg-transparent hover:text-black
            transition cursor-pointer duration-500 mt-5"
            >
              تسجيل دخول
            </button>
          </form>

            <button
              type="button"
              onClick={() => setLoginType(loginType === "admin" ? "employee" : "admin")}
              className="w-full mt-5 bg-orange-500 text-white py-2 px-5 border-2 border-orange-500 rounded-2xl cursor-pointer hover:bg-transparent hover:text-black duration-300"
            >
              {loginType === "admin" ? "تسجيل دخول موظف" : "تسجيل دخول أدمن"}
            </button>
        </div>
      </div>

      <Spinner show={loading} />

    </div>
  );
}