"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Database, LogOut, User, Shield, Briefcase, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function TopBar({
  onOpenMobile,
  onToggleSidebar,
  isSidebarCollapsed = false,
}: {
  onOpenMobile?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/customers?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/customers/")) return "Customer Dossier";
    if (pathname.startsWith("/customers")) return "Customer Directory";
    if (pathname.startsWith("/opportunities")) return "Sales Intelligence";
    if (pathname.startsWith("/scans")) return "Scan Operations";
    if (pathname.startsWith("/imports")) return "Data Ingestion";
    if (pathname.startsWith("/settings")) return "Engine Settings";
    if (pathname.startsWith("/pipeline")) return "Sales CRM Pipeline";
    return "Digital Presence Overview";
  };

  // Don't show header items on login page
  if (pathname === "/login") {
    return null;
  }

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isHead = user?.role === "HEAD";

  const handleSidebarButton = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else if (onOpenMobile) {
      onOpenMobile();
    }
  };

  return (
    <>
      <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-[#1C1B18]/8 bg-[#FCFBF0] flex items-center justify-between sticky top-0 z-20">
        {/* Title & Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {(onToggleSidebar || onOpenMobile) && (
            <button
              type="button"
              onClick={handleSidebarButton}
              className="p-2 -ml-2 rounded-lg text-[#1C1B18]/70 hover:bg-[#1C1B18]/5 transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup / Ciutkan Sidebar"}
            >
              <Menu size={20} />
            </button>
          )}

          <h1 className="text-sm sm:text-base font-semibold text-[#1C1B18] tracking-tight truncate">
            {getPageTitle()}
          </h1>

          <span className="hidden sm:inline-flex text-[11px] font-semibold text-[#FF7800] bg-[#FF7800]/10 px-2 py-0.5 rounded border border-[#FF7800]/20 font-number shrink-0">
            v1.0 MVP
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Logged In User Indicator with Role & Specialty */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#1C1B18]/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-tight text-white shrink-0 ${
                  isSuperadmin ? "bg-[#002236]" : isHead ? "bg-[#4F46E5]" : "bg-[#1A75FF]"
                }`}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "EZ"}
              </div>

              {user ? (
                <div className="hidden md:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold leading-tight text-[#1C1B18]">
                      {user.name}
                    </span>
                    {isSuperadmin ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-number bg-[#002236] text-white">
                        Superadmin
                      </span>
                    ) : isHead ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-number bg-[#4F46E5] text-white">
                        Head
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-number bg-[#FF7800] text-white">
                        Sales
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#1C1B18]/55 font-medium truncate max-w-[180px]">
                    {user.specialty ||
                      (isSuperadmin
                        ? "Platform & Strategy Lead"
                        : isHead
                        ? "Head of Operations & Sales"
                        : "Sales Specialist")}
                  </span>
                </div>
              ) : (
                <div className="hidden md:flex flex-col text-left space-y-1">
                  <div className="w-20 h-2.5 bg-[#1C1B18]/10 rounded-full animate-pulse" />
                  <div className="w-28 h-2 bg-[#1C1B18]/5 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Logout Action (With Confirmation Modal) */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              title="Keluar dari akun"
              className="p-1.5 rounded-md hover:bg-rose-50 text-[#1C1B18]/50 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari EZY CRM? Sesi Anda saat ini akan diakhiri."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}
