"use client";

import { usePathname } from "next/navigation";
import { Search, Database, LogOut, User, Shield, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "HEAD" | "SALES";
  specialty?: string;
}

import { useUser } from "@/context/UserContext";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/customers?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/customers/")) return "Customer Dossier";
    if (pathname.startsWith("/customers")) return "Customer Directory";
    if (pathname.startsWith("/opportunities")) return "Sales Intelligence";
    if (pathname.startsWith("/scans")) return "Scan Operations";
    if (pathname.startsWith("/imports")) return "Data Ingestion";
    if (pathname.startsWith("/settings")) return "Engine Settings";
    return "Digital Presence Overview";
  };

  // Don't show header items on login page
  if (pathname === "/login") {
    return null;
  }

  const isSuperadmin = user?.role === "SUPERADMIN";
  const isHead = user?.role === "HEAD";

  return (
    <header className="h-16 px-6 md:px-8 border-b border-[#1C1B18]/8 bg-[#FCFBF0] flex items-center justify-between sticky top-0 z-20">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-[#1C1B18] tracking-tight">
          {getPageTitle()}
        </h1>
        <span className="text-[11px] font-semibold text-[#FF7800] bg-[#FF7800]/10 px-2 py-0.5 rounded border border-[#FF7800]/20 font-number">
          v1.0 MVP
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Logged In User Indicator with Role & Specialty */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1C1B18]/10">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-tight text-white ${
              isSuperadmin ? "bg-[#002236]" : isHead ? "bg-[#4F46E5]" : "bg-[#1A75FF]"
            }`}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "EZ"}
            </div>

            {user ? (
              <div className="hidden lg:flex flex-col text-left">
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
                <span className="text-[10px] text-[#1C1B18]/55 font-medium truncate max-w-[190px]">
                  {user.specialty || (isSuperadmin ? "Platform & Strategy Lead" : isHead ? "Head of Operations & Sales" : "Sales Specialist")}
                </span>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col text-left space-y-1">
                <div className="w-20 h-2.5 bg-[#1C1B18]/10 rounded-full animate-pulse" />
                <div className="w-28 h-2 bg-[#1C1B18]/5 rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title="Sign Out / Switch User"
            className="p-1.5 rounded-md hover:bg-rose-50 text-[#1C1B18]/45 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
