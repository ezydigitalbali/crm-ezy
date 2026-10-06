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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Load saved sidebar collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ezy_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ezy_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleTopBarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      handleToggleCollapse();
    }
  };

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
        <div className="min-h-screen bg-[#FCFBF0] text-[#1C1B18] antialiased flex flex-row w-full">
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <TopBar
              onToggleSidebar={handleTopBarToggle}
              isSidebarCollapsed={isCollapsed}
            />
            <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </UserProvider>
  );
}
