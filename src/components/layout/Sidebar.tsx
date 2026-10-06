"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Radar, 
  UploadCloud, 
  Settings,
  TrendingUp,
  X
} from "lucide-react";

import { useUser } from "@/context/UserContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sales Pipeline", href: "/pipeline", icon: TrendingUp, badge: "CRM" },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Opportunities", href: "/opportunities", icon: Target, badge: "Hot" },
  { label: "Scans", href: "/scans", icon: Radar, superadminOnly: true },
  { label: "Imports", href: "/imports", icon: UploadCloud, superadminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.role || null;

  if (pathname === "/login") {
    return null;
  }

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.superadminOnly && userRole !== "SUPERADMIN" && userRole !== "HEAD") return false;
    return true;
  });

  const renderNavLinks = (isMobile = false) => (
    <>
      <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
        Intelligence
      </div>
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center justify-between px-3 h-10 rounded-lg text-[13px] font-medium transition-colors ${
              isActive
                ? "bg-[#FF7800] text-white shadow-sm font-semibold"
                : "text-white/70 hover:bg-white/8 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={17} className={isActive ? "text-white" : "text-white/60"} />
              <span>{item.label}</span>
            </div>
            {item.badge && !isActive && (
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#FF7800]/20 text-[#FF7800] border border-[#FF7800]/30 font-number">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      {(userRole === "SUPERADMIN" || userRole === "HEAD") && (
        <>
          <div className="pt-5 px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
            Configuration
          </div>
          <Link
            href="/settings"
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-[#FF7800] text-white font-semibold"
                : "text-white/70 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Settings size={17} className={pathname.startsWith("/settings") ? "text-white" : "text-white/60"} />
            <span>Settings</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed / Sticky on Large Screens) */}
      <aside className="hidden lg:flex w-[240px] shrink-0 bg-[#002236] text-white flex-col min-h-screen sticky top-0 h-screen select-none border-r border-[#001724]">
        {/* Brand Header with Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center border border-white/10">
            <Image
              src="/logo.png"
              alt="EZY Digital Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[15px] tracking-tight leading-tight text-white">
              EZY Digital
            </span>
            <span className="text-[11px] text-white/50 tracking-wide uppercase font-medium">
              Intelligence CRM
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {renderNavLinks(false)}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-medium text-white/80">Engines Online</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              OSM & SearXNG active.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer (< 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-[265px] max-w-[85vw] h-full bg-[#002236] text-white flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                  <Image
                    src="/logo.png"
                    alt="EZY Digital Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-sm text-white block leading-tight">
                    EZY Digital
                  </span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wide">
                    Intelligence CRM
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {renderNavLinks(true)}
            </nav>

            <div className="p-4 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-[11px] font-medium text-white/80">Engines Online</span>
                </div>
                <p className="text-[10.5px] text-white/50">OSM & SearXNG active.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
