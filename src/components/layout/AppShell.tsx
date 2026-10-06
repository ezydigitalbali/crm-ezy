"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return (
      <ToastProvider>
        <main className="min-h-screen w-full">{children}</main>
      </ToastProvider>
    );
  }

  return (
    <UserProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#FCFBF0] text-[#1C1B18] antialiased flex flex-row w-full overflow-x-hidden">
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <TopBar onOpenMobile={() => setMobileMenuOpen(true)} />
            <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
