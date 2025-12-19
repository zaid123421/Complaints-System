"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import "./globals.css";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  weight: ['200','300','400','500','600','700','800','900'],
  subsets: ['latin', 'arabic'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/login");

  return (
    <html className={`${cairo.className} scroll-smooth`}>
      <head>
        <title>نظام الشكاوي</title>
      </head>
      <body dir="rtl" className="min-h-screen bg-gray-100">
        {!hideSidebar && <Sidebar />}

        <main className={!hideSidebar ? "flex-1 ml-16 sm:ml-64" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
