"use client";

import React from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.role || null;

  if (pathname === "/login") {
    return null;
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.superadminOnly && userRole !== "SUPERADMIN" && userRole !== "HEAD") return false;
    return true;
  });

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Sticky, Fixed Height, Collapsible Buka-Tutup) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#002236] text-white sticky top-0 h-screen select-none border-r border-[#001724] transition-all duration-200 z-30 ${
          isCollapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-white/10 shrink-0 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center border border-white/10">
              <Image
                src="/logo.png"
                alt="EZY Digital Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[14px] tracking-tight leading-tight text-white truncate">
                  EZY Digital
                </span>
                <span className="text-[10px] text-white/50 tracking-wide uppercase font-medium">
                  Intelligence CRM
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-2.5 pb-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
              Intelligence
            </div>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-lg h-10 text-[13px] font-medium transition-colors ${
                  isCollapsed ? "justify-center px-0 w-10 mx-auto" : "justify-between px-3 w-full"
                } ${
                  isActive
                    ? "bg-[#FF7800] text-white shadow-sm font-semibold"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                  <Icon size={18} className={isActive ? "text-white" : "text-white/60"} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && !isActive && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#FF7800]/20 text-[#FF7800] border border-[#FF7800]/30 font-number">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {(userRole === "SUPERADMIN" || userRole === "HEAD") && (
            <>
              {!isCollapsed && (
                <div className="pt-4 px-2.5 pb-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
                  Configuration
                </div>
              )}
              {isCollapsed && <div className="my-2 border-t border-white/10" />}

              <Link
                href="/settings"
                title={isCollapsed ? "Settings" : undefined}
                className={`flex items-center rounded-lg h-10 text-[13px] font-medium transition-colors ${
                  isCollapsed ? "justify-center px-0 w-10 mx-auto" : "gap-3 px-3 w-full"
                } ${
                  pathname.startsWith("/settings")
                    ? "bg-[#FF7800] text-white font-semibold"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Settings size={18} className={pathname.startsWith("/settings") ? "text-white" : "text-white/60"} />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Toggle Bar (Clean Buka-Tutup, No Engines Online) */}
        {onToggleCollapse && (
          <div className="p-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`w-full flex items-center rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs font-medium ${
                isCollapsed ? "justify-center" : "gap-2"
              }`}
              title={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <>
                  <PanelLeftClose size={16} />
                  <span>Ciutkan Sidebar</span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* 2. MOBILE SLIDE-OVER DRAWER (Layar HP / Tablet < 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
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
                    onClick={onCloseMobile}
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
                    onClick={onCloseMobile}
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
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
