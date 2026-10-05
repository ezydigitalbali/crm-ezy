import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { Settings, Database, Server, Shield, Clock, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";
import SisterCompanyManager from "@/components/settings/SisterCompanyManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await getSessionUser();

  const isSuperadmin = sessionUser?.role === "SUPERADMIN";
  const isHead = sessionUser?.role === "HEAD";

  if (sessionUser && !isSuperadmin && !isHead) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#1C1B18]">Akses Terbatas: Khusus Management</h2>
        <p className="text-xs text-[#1C1B18]/60">
          Pengaturan sistem dan manajemen Sister Company hanya dapat diakses oleh Superadmin dan Head. Anda saat ini login sebagai <strong className="text-[#002236]">{sessionUser.name} ({sessionUser.role})</strong>.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002236] text-white text-xs font-semibold hover:bg-[#FF7800] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }
  const [settings, auditLogs, users, sisterCompanies, customers] = await Promise.all([
    prisma.setting.findMany(),
    prisma.auditLog.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
    }),
    prisma.user.findMany({
      orderBy: { role: "asc" },
    }),
    prisma.sisterCompany.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: { sister_company: true },
    }),
  ]);

  const customerCounts = customers.reduce((acc, c) => {
    if (c.sister_company) {
      acc[c.sister_company] = (acc[c.sister_company] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <Settings size={22} className="text-[#FF7800]" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            {isHead ? "Management & Organization Settings" : "Intelligence Platform Settings"}
          </h2>
        </div>
        <p className="text-xs text-[#1C1B18]/60 mt-1">
          {isHead 
            ? "Sister company database, user accounts, and system operations audit trail."
            : "Infrastructure configurations, discovery engines, sister companies, and audit events."}
        </p>
      </div>

      {/* Services Health Cards (Khusus Superadmin) */}
      {isSuperadmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Postgres */}
          <div className="bg-white rounded-xl p-5 border border-[#1C1B18]/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#1A75FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                  Database
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="text-sm font-semibold text-[#1C1B18]">
              PostgreSQL 16 (Docker)
            </div>
            <p className="text-[11px] font-number text-[#1C1B18]/50 mt-1">
              localhost:5434 • crm_ezy
            </p>
          </div>

          {/* Redis */}
          <div className="bg-white rounded-xl p-5 border border-[#1C1B18]/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                  Job Queue
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <div className="text-sm font-semibold text-[#1C1B18]">
              Redis 7 (BullMQ)
            </div>
            <p className="text-[11px] font-number text-[#1C1B18]/50 mt-1">
              localhost:6379 • db 0
            </p>
          </div>

          {/* SearXNG */}
          <div className="bg-white rounded-xl p-5 border border-[#1C1B18]/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#FF7800]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
                  Search Engine
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Private Local
              </span>
            </div>
            <div className="text-sm font-semibold text-[#1C1B18]">
              SearXNG Metasearch
            </div>
            <p className="text-[11px] font-number text-[#1C1B18]/50 mt-1">
              localhost:8080 • JSON API
            </p>
          </div>
        </div>
      )}

      {/* 1. Sister Companies Dynamic Management (Tampil untuk Superadmin & Head) */}
      <SisterCompanyManager 
        initialCompanies={sisterCompanies} 
        customerCounts={customerCounts} 
      />

      {/* Configuration Form (Khusus Superadmin) */}
      {isSuperadmin && (
        <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
            Discovery Engine Tuning
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                Active Search Provider
              </label>
              <input
                type="text"
                readOnly
                value={settingsMap.SEARCH_PROVIDER || "SEARXNG"}
                className="w-full h-9 px-3 bg-[#FCFBF0] border border-[#1C1B18]/15 rounded-md text-[#1C1B18] font-medium"
              />
              <span className="text-[11px] text-[#1C1B18]/50 mt-1 block">
                Self-hosted metasearch without recurring third-party search fees.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                SearXNG Base URL
              </label>
              <input
                type="text"
                readOnly
                value={settingsMap.SEARXNG_URL || "http://localhost:8080"}
                className="w-full h-9 px-3 bg-[#FCFBF0] border border-[#1C1B18]/15 rounded-md font-number text-[#1C1B18]"
              />
              <span className="text-[11px] text-[#1C1B18]/50 mt-1 block">
                Internal Docker host bridge connection.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                Maximum Worker Concurrency
              </label>
              <input
                type="text"
                readOnly
                value={settingsMap.MAX_CONCURRENCY || "3"}
                className="w-full h-9 px-3 bg-[#FCFBF0] border border-[#1C1B18]/15 rounded-md font-number text-[#1C1B18]"
              />
              <span className="text-[11px] text-[#1C1B18]/50 mt-1 block">
                Concurrent discovery checks to prevent IP rate-limiting.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1B18] mb-1">
                Automated Recheck Interval
              </label>
              <input
                type="text"
                readOnly
                value={`${settingsMap.AUTO_RECHECK_DAYS || "7"} days`}
                className="w-full h-9 px-3 bg-[#FCFBF0] border border-[#1C1B18]/15 rounded-md font-number text-[#1C1B18]"
              />
              <span className="text-[11px] text-[#1C1B18]/50 mt-1 block">
                Scheduled cron re-verification interval for active prospects.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Team & User Role Management (Tampil untuk Superadmin & Head) */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0]/60 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
              User Accounts & Role Access
            </h4>
            <p className="text-[11px] text-[#1C1B18]/50 mt-0.5">
              Superadmin, Head, and Sales roles with full digital presence visibility (Website & Social Media).
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FF7800]/15 text-[#c25900] font-number">
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1C1B18]/10 bg-[#FCFBF0]/40 text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
                <th className="py-2.5 px-4">User Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Sales Scope / Focus</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/8">
              {users.map((u) => {
                const isSuper = u.role === "SUPERADMIN";
                const isHeadRole = u.role === "HEAD";
                return (
                  <tr key={u.id} className="hover:bg-[#FCFBF0]/40">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-xs text-[#1C1B18] block">
                        {u.name}
                      </span>
                      <span className="text-[11px] font-number text-[#1C1B18]/50 block">
                        {u.email}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-number ${
                        isSuper 
                          ? "bg-[#002236] text-white" 
                          : isHeadRole
                          ? "bg-[#4F46E5] text-white"
                          : "bg-[#1A75FF] text-white"
                      }`}>
                        {isSuper ? "Superadmin" : isHeadRole ? "Head" : "Sales Specialist"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#1C1B18]/80 font-medium">
                      {u.specialty || "Website & Social Media"}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-[11px] text-[#1C1B18]/60 font-medium">
                      {isSuper 
                        ? "Full Admin & Engine Control" 
                        : isHeadRole 
                        ? "Full Operations & Pipeline Oversight" 
                        : "View, Filter, Scan & Export All Leads"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Audit Logs (Tampil untuk Superadmin & Head) */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#1C1B18]/10 bg-[#FCFBF0]/60 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]/80">
            System Activity Audit Trail
          </h4>
          <span className="text-[11px] text-[#1C1B18]/50">
            Internal Operations Log
          </span>
        </div>

        <div className="divide-y divide-[#1C1B18]/8 text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-[#1C1B18]/50">No logs recorded.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-[#FCFBF0]/40">
                <div className="flex items-center gap-3">
                  <span className="font-number text-[#1C1B18]/50 text-[11px]">
                    {new Date(log.created_at).toLocaleString("en-US", {
                      hour12: false,
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#002236]/10 text-[#002236]">
                    {log.action}
                  </span>
                  <span className="text-[#1C1B18]/70">
                    by <strong>{log.user_name}</strong>
                  </span>
                </div>
                {log.metadata && (
                  <span className="font-number text-[11px] text-[#1C1B18]/50 truncate max-w-xs">
                    {log.metadata}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
