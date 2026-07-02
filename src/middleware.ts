import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard": ["PLATFORM_ADMIN"],
  "/users": ["PLATFORM_ADMIN"],
  "/reports": ["SUPERVISOR"],
  "/audit-logs": ["PLATFORM_ADMIN"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  if (!token || !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
      if (role === "PLATFORM_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/complaints", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Images).*)"],
};
