"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Role } from "@/lib/permissions";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role") as Role | undefined;

    if (!token || !role) {
      router.replace("/login");
      return;
    }

    if (role === "PLATFORM_ADMIN") {
      router.replace("/dashboard");
    } else {
      router.replace("/employee/dashboard");
    }
  }, [router]);

  return null;
}
