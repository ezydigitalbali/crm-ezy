"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Building2, 
  User as UserIcon, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  Handshake, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  ShieldCheck, 
  Activity, 
  Award, 
  Layers, 
  PhoneCall, 
  Flame, 
  ArrowUpRight,
  UserCheck,
  Trophy,
  BadgeDollarSign,
  TrendingUp,
  Globe,
  Camera,
  Share2,
  Plus
} from "lucide-react";
import LeadStatusBadge, { LeadStatusType, LEAD_STATUS_CONFIG } from "@/components/ui/LeadStatusBadge";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";
import CrmUpdateModal, { CrmCustomerTarget, SalesUserOption } from "@/components/crm/CrmUpdateModal";
import AddCustomerModal from "@/components/customers/AddCustomerModal";
import CustomDropdown from "@/components/ui/CustomDropdown";
import Pagination from "@/components/ui/Pagination";

interface PipelineCustomer {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  business_category: string | null;
  sister_company: string | null;
  lead_status: string;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  last_contacted_at: string | null;
  last_contacted_by: string | null;
  lead_notes: string | null;
  website_domain?: string | null;
  instagram_username?: string | null;
  opportunity_type?: string;
  activities_count: number;
  offering_value?: number | null;
  deal_value?: number | null;
  closing_services?: string | null;
}

export interface ActivityFeedItem {
  id: string;
  customer_id: string;
  business_name: string;
  sister_company: string | null;
  user_name: string;
  action_type: string;
  status_from: string | null;
  status_to: string | null;
  offering_value?: number | null;
  deal_value?: number | null;
  closing_services?: string | null;
  notes: string | null;
  created_at: string;
}

export default function PipelineConsoleClient({
  customers,
  users,
  activities = [],
  initialSales = "ALL",
}: {
  customers: PipelineCustomer[];
  users: SalesUserOption[];
  activities?: ActivityFeedItem[];
  initialSales?: string;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<string>(initialSales);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSisterCompany, setSelectedSisterCompany] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modals state
  const [pitchCustomer, setPitchCustomer] = useState<PitchCustomerData | null>(null);
  const [updateCustomer, setUpdateCustomer] = useState<CrmCustomerTarget | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load current user session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setCurrentUser(d.user);
          // If sales user, automatically focus on their own pipeline by default!
          if (d.user.role === "SALES" && initialSales === "ALL") {
            setSelectedSales(d.user.id);
          }
        }
      })
      .catch(() => {});
  }, [initialSales]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSales, selectedStatus, selectedSisterCompany, search]);

  const isSales = currentUser?.role === "SALES";
  const isSuperadmin = currentUser?.role === "SUPERADMIN" || currentUser?.role === "HEAD";

  // Distinct sister companies
  const sisterCompanies = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.sister_company) set.add(c.sister_company);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Compute leaderboard per sales user (for team benchmark comparison)
  const salesLeaderboard = useMemo(() => {
    return users.map((u) => {
      const userCustomers = customers.filter((c) => c.assigned_to_id === u.id);
      const total = userCustomers.length;
      const contacted = userCustomers.filter((c) => c.lead_status !== "NEW_LEAD").length;
      const negotiation = userCustomers.filter((c) => c.lead_status === "NEGOTIATION").length;
      const won = userCustomers.filter((c) => c.lead_status === "SUCCESS").length;
      const failed = userCustomers.filter((c) => c.lead_status === "FAILED").length;
      const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

      const totalDealWon = userCustomers
        .filter((c) => c.lead_status === "SUCCESS")
        .reduce((sum, c) => sum + (c.deal_value || 0), 0);
      const totalOffering = userCustomers.reduce((sum, c) => sum + (c.offering_value || 0), 0);

      // Services breakdown
      let countWeb = 0;
      let countSeo = 0;
      let countSocmed = 0;
      let countProd = 0;
      userCustomers.forEach((c) => {
        if (c.closing_services) {
          const s = c.closing_services;
          if (s.includes("WEBSITE")) countWeb++;
          if (s.includes("SEO")) countSeo++;
          if (s.includes("SOCMED")) countSocmed++;
          if (s.includes("PRODUCTION")) countProd++;
        }
      });

      const lastContactCust = [...userCustomers]
        .filter((c) => c.last_contacted_at)
        .sort((a, b) => new Date(b.last_contacted_at!).getTime() - new Date(a.last_contacted_at!).getTime())[0];

      return {
        user: u,
        total,
        contacted,
        negotiation,
        won,
        failed,
        winRate,
        totalDealWon,
        totalOffering,
        servicesCount: { web: countWeb, seo: countSeo, socmed: countSocmed, prod: countProd },
        lastContactedAt: lastContactCust?.last_contacted_at || null,
      };
    });
  }, [users, customers]);

  // Unassigned count
  const unassignedCount = useMemo(() => {
    return customers.filter((c) => !c.assigned_to_id).length;
  }, [customers]);

  // Filter customers by active sales rep, status, sister company, search query
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // If user is sales, strictly only show their own leads!
      if (isSales && currentUser) {
        if (c.assigned_to_id !== currentUser.id) return false;
      } else {
        // Superadmin filter
        if (selectedSales !== "ALL") {
          if (selectedSales === "UNASSIGNED") {
            if (c.assigned_to_id) return false;
          } else {
            if (c.assigned_to_id !== selectedSales) return false;
          }
        }
      }

      // Status filter
      if (selectedStatus !== "ALL" && c.lead_status !== selectedStatus) {
        return false;
      }

      // Sister Company filter
      if (selectedSisterCompany !== "ALL" && c.sister_company !== selectedSisterCompany) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mName = c.business_name.toLowerCase().includes(q);
        const mContact = c.contact_name?.toLowerCase().includes(q);
        const mPhone = c.phone?.toLowerCase().includes(q);
        const mNotes = c.lead_notes?.toLowerCase().includes(q);
        const mSales = c.assigned_to_name?.toLowerCase().includes(q);
        if (!mName && !mContact && !mPhone && !mNotes && !mSales) return false;
      }

      return true;
    });
  }, [customers, isSales, currentUser, selectedSales, selectedStatus, selectedSisterCompany, search]);

  // Paginated customers for current page
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Compute metrics for the currently active pool
  const currentSalesPool = useMemo(() => {
    if (isSales && currentUser) {
      return customers.filter((c) => c.assigned_to_id === currentUser.id);
    }
    if (selectedSales === "ALL") return customers;
    if (selectedSales === "UNASSIGNED") return customers.filter((c) => !c.assigned_to_id);
    return customers.filter((c) => c.assigned_to_id === selectedSales);
  }, [customers, isSales, currentUser, selectedSales]);

  const kpis = useMemo(() => {
    const total = currentSalesPool.length;
    const newLead = currentSalesPool.filter((c) => c.lead_status === "NEW_LEAD").length;
    const contacted = currentSalesPool.filter((c) => c.lead_status === "CONTACTED").length;
    const followUp = currentSalesPool.filter((c) => c.lead_status === "FOLLOW_UP").length;
    const negotiation = currentSalesPool.filter((c) => c.lead_status === "NEGOTIATION").length;
    const success = currentSalesPool.filter((c) => c.lead_status === "SUCCESS").length;
    const failed = currentSalesPool.filter((c) => c.lead_status === "FAILED").length;
    const closingRate = total > 0 ? Math.round((success / total) * 100) : 0;
    const totalOfferingValue = currentSalesPool.reduce((sum, c) => sum + (c.offering_value || 0), 0);
    const totalDealWonValue = currentSalesPool
      .filter((c) => c.lead_status === "SUCCESS")
      .reduce((sum, c) => sum + (c.deal_value || 0), 0);

    return { 
      total, 
      newLead, 
      contacted, 
      followUp, 
      negotiation, 
      success, 
      failed, 
      closingRate,
      totalOfferingValue,
      totalDealWonValue,
    };
  }, [currentSalesPool]);

  const handleClaimLead = async (customerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClaimingId(customerId);
    try {
      const res = await fetch("/api/crm/claim-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Gagal mengambil prospek");
      }
    } catch (err) {
      console.error("Claim lead error:", err);
    } finally {
      setClaimingId(null);
    }
  };

  const formatLastContact = (dateStr: string | null, by: string | null) => {
    if (!dateStr) return <span className="text-[#1C1B18]/40 italic text-xs">Belum dihubungi</span>;
    const date = new Date(dateStr);
    const diffHours = Math.round((Date.now() - date.getTime()) / (1000 * 3600));
    
    let timeText = "";
    if (diffHours < 1) timeText = "Baru saja";
    else if (diffHours < 24) timeText = `${diffHours} jam lalu`;
    else {
      const days = Math.round(diffHours / 24);
      timeText = `${days} hari lalu`;
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-[#002236] text-[11px] flex items-center gap-1">
          <Clock size={11} className="text-[#FF7800]" />
          <span>{timeText}</span>
        </span>
        {by && (
          <span className="text-[10px] text-[#1C1B18]/50 truncate max-w-[130px]">
            oleh {by}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SALES WORKLOAD & LEADERBOARD COMPARISON CARDS */}
      <div className="bg-[#002236] text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7800] text-white flex items-center justify-center font-bold">
              <Trophy size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Leaderboard & Beban Kerja Tim Sales</span>
                {isSales && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Benchmark Tim
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-white/70">
                {isSales
                  ? "Bandingkan progres dan performa pitching Anda dengan rekan sales lainnya secara transparan."
                  : "Superadmin Helicopter View: Pantau produktivitas, velocity pitching, dan rasio deal closing setiap sales."}
              </p>
            </div>
          </div>

          {/* Actions: Tambah Data Baru & Toggle Live Stream */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF7800] hover:bg-[#e66c00] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Tambah Prospek Baru</span>
            </button>

            <button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Activity size={13} className="text-[#FF7800]" />
              <span>{showActivityFeed ? "Tutup Stream" : "Live Stream"}</span>
            </button>
          </div>
        </div>

        {/* Sales Cards Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {salesLeaderboard.map((item) => {
            const isMe = currentUser?.id === item.user.id;
            const isSelected = selectedSales === item.user.id;
            return (
              <div
                key={item.user.id}
                onClick={() => {
                  if (isSuperadmin) {
                    setSelectedSales(isSelected ? "ALL" : item.user.id);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSuperadmin ? "cursor-pointer" : ""
                } ${
                  isMe
                    ? "bg-white/15 border-emerald-400 ring-2 ring-emerald-400"
                    : isSelected
                    ? "bg-white/15 border-[#FF7800] ring-2 ring-[#FF7800]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isMe ? "bg-emerald-500" : "bg-[#FF7800]"
                    }`}>
                      {item.user.name.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-white leading-tight">{item.user.name}</h4>
                        {isMe && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">
                            Saya
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/60 block">{item.user.specialty?.split("&")[0].trim() || item.user.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.won} Deals
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/10 text-center">
                  <div>
                    <span className="text-[10px] text-white/60 block">Prospek</span>
                    <strong className="text-xs font-bold font-number text-white">{item.total}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block">Pitching</span>
                    <strong className="text-xs font-bold font-number text-[#FF7800]">{item.contacted}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block">Win Rate</span>
                    <strong className="text-xs font-bold font-number text-emerald-300">{item.winRate}%</strong>
                  </div>
                </div>

                {/* Revenue Closing & Pipeline Stats */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9.5px] text-emerald-300/80 block uppercase font-bold">Closing Won</span>
                    <strong className="text-xs font-bold font-number text-emerald-300">
                      {item.totalDealWon > 0 ? `Rp ${item.totalDealWon.toLocaleString("id-ID")}` : "Rp 0"}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-white/50 block uppercase font-medium">Pipeline Offer</span>
                    <strong className="text-[11px] font-semibold font-number text-white/80">
                      {item.totalOffering > 0 ? `Rp ${item.totalOffering.toLocaleString("id-ID")}` : "Rp 0"}
                    </strong>
                  </div>
                </div>

                {/* Services Closed Mini-Badges */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-[9.5px]">
                  <span className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Closed:</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-number" title="Website Dev">Web: {item.servicesCount.web}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-number" title="SEO">SEO: {item.servicesCount.seo}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-number" title="Social Media">Socmed: {item.servicesCount.socmed}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-white font-number" title="Production">Media: {item.servicesCount.prod}</span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
                  <span>Pitching terakhir:</span>
                  <span className="text-white/80 font-medium">
                    {item.lastContactedAt ? new Date(item.lastContactedAt).toLocaleDateString("id-ID", { month: "short", day: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Unassigned Pool Card (ONLY VISIBLE FOR SUPERADMIN) */}
          {isSuperadmin && (
            <div
              onClick={() => setSelectedSales(selectedSales === "UNASSIGNED" ? "ALL" : "UNASSIGNED")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedSales === "UNASSIGNED"
                  ? "bg-white/15 border-amber-400 ring-2 ring-amber-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    !
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Belum Diassign</h4>
                    <span className="text-[10px] text-white/60 block">Pool Prospek Baru</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-number">
                  {unassignedCount} Prospek
                </span>
              </div>

              <p className="text-[11px] text-white/70 mt-3 pt-2.5 border-t border-white/10">
                Data prospek yang belum di-handle sales manapun.
              </p>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
                <span>Klik untuk delegasikan</span>
                <ArrowUpRight size={12} />
              </div>
            </div>
          )}
        </div>

        {/* Live Pitching Activity Stream (Collapsible) */}
        {showActivityFeed && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Flame size={12} className="text-[#FF7800]" />
                <span>Live Activity Stream: Riwayat Interaksi & Pitching Terkini</span>
              </span>
              <span className="text-[10px] text-white/50">{activities.length} aktivitas terekam</span>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-white/50 py-2 italic">Belum ada riwayat aktivitas pitching tercatat.</p>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {activities.slice(0, 10).map((act) => (
                  <div
                    key={act.id}
                    className="min-w-[260px] max-w-[280px] bg-white/10 rounded-xl p-2.5 border border-white/10 shrink-0 text-xs space-y-1.5 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#FF7800] truncate max-w-[150px]">{act.user_name}</span>
                      <span className="text-white/50">{new Date(act.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div className="font-semibold text-white truncate max-w-[250px]">
                      {act.business_name}
                    </div>

                    {act.notes && (
                      <p className="text-[11px] text-white/80 line-clamp-1 italic bg-black/20 px-2 py-0.5 rounded">
                        "{act.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                      <span className="text-white/60">{act.sister_company || "Sister Company"}</span>
                      {act.status_to && (
                        <span className="px-1.5 py-0.2 rounded font-bold bg-[#FF7800]/25 text-[#FF7800] text-[9.5px]">
                          {act.status_to.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. SALES TABS (DIFFERENTIATED FOR SALES VS SUPERADMIN) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1C1B18]/10 pb-3">
        {isSuperadmin && (
          <button
            onClick={() => setSelectedSales("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              selectedSales === "ALL"
                ? "bg-[#002236] text-white shadow-xs"
                : "bg-white text-[#1C1B18]/70 border border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
            }`}
          >
            <span>Semua Tim Sales (Helicopter Pool)</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-number font-bold ${
              selectedSales === "ALL" ? "bg-white/20 text-white" : "bg-[#1C1B18]/10 text-[#1C1B18]"
            }`}>
              {customers.length}
            </span>
          </button>
        )}

        {isSales ? (
          /* Sales User View: Dedicated Personal Tab */
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FF7800] text-white shadow-xs flex items-center gap-2">
              <UserCheck size={14} />
              <span>Prospek Milik Saya ({currentUser?.name})</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-number font-bold bg-white/25 text-white">
                {currentSalesPool.length}
              </span>
            </div>
            <span className="text-xs text-[#1C1B18]/50 italic ml-1">
              (Hanya menampilkan data yang telah di-assign ke Anda)
            </span>
          </div>
        ) : (
          /* Superadmin Tabs per Sales Rep */
          users.map((u) => {
            const count = customers.filter((c) => c.assigned_to_id === u.id).length;
            const isActive = selectedSales === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setSelectedSales(u.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#FF7800] text-white shadow-xs"
                    : "bg-white text-[#1C1B18]/70 border border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
                }`}
              >
                <UserIcon size={12} />
                <span>{u.name} ({u.specialty ? u.specialty.split("&")[0].trim() : u.role})</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-number font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-[#1C1B18]/10 text-[#1C1B18]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })
        )}

        {/* Belum Diassign (ONLY FOR SUPERADMIN, HIDDEN FROM SALES!) */}
        {isSuperadmin && (
          <button
            onClick={() => setSelectedSales("UNASSIGNED")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              selectedSales === "UNASSIGNED"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-white text-[#1C1B18]/60 border border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
            }`}
          >
            <span>Belum Diassign</span>
            <span className="font-number text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
              {unassignedCount}
            </span>
          </button>
        )}
      </div>

      {/* 3. PIPELINE STAGE KPI CARDS & FINANCIAL REVENUE */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Pool */}
          <div className="bg-white p-3.5 rounded-xl border border-[#1C1B18]/10 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B18]/50 block">
              Total Prospek
            </span>
            <span className="font-number text-xl font-bold text-[#002236] block mt-1">
              {kpis.total}
            </span>
            <span className="text-[10px] text-[#1C1B18]/45">
              {isSales ? "Pipeline Anda" : selectedSales === "ALL" ? "Seluruh database" : "Target terpilih"}
            </span>
          </div>

          {/* New Leads */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              New Leads
            </span>
            <span className="font-number text-xl font-bold text-slate-800 block mt-1">
              {kpis.newLead}
            </span>
            <span className="text-[10px] text-slate-400">Belum dihubungi</span>
          </div>

          {/* Contacted */}
          <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Contacted
            </span>
            <span className="font-number text-xl font-bold text-blue-800 block mt-1">
              {kpis.contacted}
            </span>
            <span className="text-[10px] text-blue-500">Sudah di-WA / telepon</span>
          </div>

          {/* Follow Up */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Follow Up
            </span>
            <span className="font-number text-xl font-bold text-amber-800 block mt-1">
              {kpis.followUp}
            </span>
            <span className="text-[10px] text-amber-500">Proses diskusi</span>
          </div>

          {/* Negotiation */}
          <div className="bg-white p-3.5 rounded-xl border border-[#FF7800]/30 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7800] block">
              Negotiation
            </span>
            <span className="font-number text-xl font-bold text-[#FF7800] block mt-1">
              {kpis.negotiation}
            </span>
            <span className="text-[10px] text-[#FF7800]/80">Proposal / Penawaran</span>
          </div>

          {/* Success Won */}
          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Won / Deal
            </span>
            <span className="font-number text-xl font-bold text-emerald-700 block mt-1">
              {kpis.success}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold font-number">
              {kpis.closingRate}% Conversion
            </span>
          </div>
        </div>

        {/* Financial Revenue Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white p-3.5 rounded-xl border border-emerald-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 ring-4 ring-emerald-500/15">
                <BadgeDollarSign size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                  Total Nilai Deal Closing (Won)
                </span>
                <span className="font-number text-lg sm:text-xl font-bold text-emerald-700">
                  {kpis.totalDealWonValue > 0 ? `Rp ${kpis.totalDealWonValue.toLocaleString("id-ID")}` : "Rp 0"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded font-number">
              {kpis.success} Deal Disepakati
            </span>
          </div>

          <div className="bg-gradient-to-r from-[#FF7800]/10 via-[#FF7800]/5 to-white p-3.5 rounded-xl border border-[#FF7800]/25 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF7800] text-white flex items-center justify-center shadow-xs shrink-0 ring-4 ring-[#FF7800]/15">
                <TrendingUp size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c25900] block">
                  Total Nilai Pipeline Penawaran
                </span>
                <span className="font-number text-lg sm:text-xl font-bold text-[#002236]">
                  {kpis.totalOfferingValue > 0 ? `Rp ${kpis.totalOfferingValue.toLocaleString("id-ID")}` : "Rp 0"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#c25900] bg-[#FF7800]/15 border border-[#FF7800]/20 px-2.5 py-0.5 rounded font-number">
              Estimasi Revenue
            </span>
          </div>
        </div>
      </div>

      {/* 4. FILTER BAR WITH MODERN CUSTOM DROPDOWNS */}
      <div className="bg-white rounded-xl p-4 border border-[#1C1B18]/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#1C1B18]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari bisnis, PIC, catatan..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] transition-colors"
            />
          </div>

          {/* Status Pipeline Custom Dropdown */}
          <CustomDropdown
            prefix="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "ALL", label: "Semua Status" },
              { value: "NEW_LEAD", label: "New Lead" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "NEGOTIATION", label: "Negotiation" },
              { value: "SUCCESS", label: "Success / Won" },
              { value: "FAILED", label: "Failed / Lost" },
            ]}
          />

          {/* Sister Company Custom Dropdown */}
          <CustomDropdown
            prefix="Sister Co"
            value={selectedSisterCompany}
            onChange={setSelectedSisterCompany}
            options={[
              { value: "ALL", label: "Semua Sister Co" },
              ...sisterCompanies.map((sc) => ({ value: sc, label: sc })),
            ]}
          />
        </div>

        <div className="text-xs text-[#1C1B18]/60 font-medium">
          Menampilkan <span className="font-number font-bold text-[#1C1B18]">{filteredCustomers.length}</span> dari{" "}
          <span className="font-number">{currentSalesPool.length}</span> prospek
        </div>
      </div>

      {/* 5. MAIN DATA TABLE */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1C1B18]/10 bg-[#FCFBF0]/70 text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
                <th className="py-3 px-4">Bisnis & Kategori</th>
                <th className="py-3 px-3">Sister Company</th>
                <th className="py-3 px-3">Sales PIC</th>
                <th className="py-3 px-3">Status Pipeline</th>
                <th className="py-3 px-3">Nilai (Deal / Penawaran)</th>
                <th className="py-3 px-3">Layanan Closing</th>
                <th className="py-3 px-3">Kontak Terakhir</th>
                <th className="py-3 px-3">Catatan / Follow Up</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/8 text-xs">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#1C1B18]/50">
                    Tidak ada prospek yang sesuai dengan filter ini.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const isAssignedToMe = currentUser && c.assigned_to_id === currentUser.id;

                  return (
                    <tr key={c.id} className="h-[60px] hover:bg-[#FCFBF0]/70 transition-colors">
                      {/* Business & Category */}
                      <td className="py-2.5 px-4 font-medium text-[#1C1B18]">
                        <Link 
                          href={`/customers/${c.id}`}
                          className="font-bold text-xs text-[#1C1B18] hover:text-[#FF7800] block truncate max-w-[200px]"
                        >
                          {c.business_name}
                        </Link>
                        <div className="text-[11px] text-[#1C1B18]/50 flex items-center gap-1.5 mt-0.5">
                          <span>{c.business_category || "Bisnis"}</span>
                          {c.city && <span>• {c.city}</span>}
                        </div>
                      </td>

                      {/* Sister Company */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FF7800]/10 text-[#c25900] border border-[#FF7800]/25 truncate max-w-[140px]">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate">{c.sister_company || "EZY Property"}</span>
                        </span>
                      </td>

                      {/* Sales PIC */}
                      <td className="py-2.5 px-3">
                        {c.assigned_to_name ? (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isAssignedToMe
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                              : "bg-[#002236]/5 text-[#002236] border-[#002236]/10"
                          }`}>
                            <span className={`w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[9px] font-bold ${
                              isAssignedToMe ? "bg-emerald-600" : "bg-[#002236]"
                            }`}>
                              {c.assigned_to_name.charAt(0).toUpperCase()}
                            </span>
                            <span>{isAssignedToMe ? "Anda (Saya)" : c.assigned_to_name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleClaimLead(c.id, e)}
                            disabled={claimingId === c.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF7800]/12 hover:bg-[#FF7800] text-[#c25900] hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs border border-[#FF7800]/30 disabled:opacity-50"
                            title="Ambil prospek ini untuk Anda pitching sendiri"
                          >
                            <UserCheck size={11} />
                            <span>{claimingId === c.id ? "Mengambil..." : "Ambil Prospek"}</span>
                          </button>
                        )}
                      </td>

                      {/* Status Pipeline */}
                      <td className="py-2.5 px-3">
                        <LeadStatusBadge status={c.lead_status} size="sm" />
                      </td>

                      {/* Nilai Penawaran / Deal */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {c.deal_value && c.deal_value > 0 ? (
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-emerald-600 block">Deal Won</span>
                            <span className="font-number font-bold text-xs text-emerald-700">
                              Rp {c.deal_value.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : c.offering_value && c.offering_value > 0 ? (
                          <div>
                            <span className="text-[9.5px] uppercase font-semibold text-amber-600 block">Penawaran</span>
                            <span className="font-number font-semibold text-xs text-[#002236]">
                              Rp {c.offering_value.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#1C1B18]/30">—</span>
                        )}
                      </td>

                      {/* Closing Services */}
                      <td className="py-2.5 px-3">
                        {c.closing_services ? (
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {c.closing_services.split(",").map((s) => {
                              const key = s.trim();
                              if (key === "WEBSITE") return <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><Globe size={10} /> Web</span>;
                              if (key === "SEO") return <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200"><Search size={10} /> SEO</span>;
                              if (key === "SOCMED") return <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-pink-50 text-pink-700 border border-pink-200"><Share2 size={10} /> Socmed</span>;
                              if (key === "PRODUCTION") return <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><Camera size={10} /> Media</span>;
                              return <span key={key} className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700">{key}</span>;
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#1C1B18]/30">—</span>
                        )}
                      </td>

                      {/* Last Contact */}
                      <td className="py-2.5 px-3">
                        {formatLastContact(c.last_contacted_at, c.last_contacted_by)}
                      </td>

                      {/* Notes / Last Follow Up */}
                      <td className="py-2.5 px-3 max-w-[200px]">
                        {c.lead_notes ? (
                          <span className="text-[11px] text-[#1C1B18]/70 block truncate" title={c.lead_notes}>
                            {c.lead_notes}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#1C1B18]/35 italic">Belum ada catatan</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Chat WA */}
                          <button
                            onClick={() => setPitchCustomer({
                              id: c.id,
                              business_name: c.business_name,
                              contact_name: c.contact_name,
                              phone: c.phone,
                              business_category: c.business_category,
                              sister_company: c.sister_company,
                              website_domain: c.website_domain,
                              instagram_username: c.instagram_username,
                              opportunity_type: c.opportunity_type || "website",
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366]/12 hover:bg-[#25D366] text-[#0f8b3c] hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            title="Buka WhatsApp Sekarang"
                          >
                            <WhatsAppIcon size={12} />
                            <span>WA</span>
                          </button>

                          {/* Update CRM Modal */}
                          <button
                            onClick={() => setUpdateCustomer({
                              id: c.id,
                              business_name: c.business_name,
                              contact_name: c.contact_name,
                              phone: c.phone,
                              lead_status: c.lead_status,
                              assigned_to_id: c.assigned_to_id,
                              lead_notes: c.lead_notes,
                              offering_value: c.offering_value,
                              deal_value: c.deal_value,
                              closing_services: c.closing_services,
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF7800]/10 hover:bg-[#FF7800] text-[#c25900] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                            title="Update Status CRM"
                          >
                            <Edit3 size={11} />
                            <span>Update</span>
                          </button>

                          {/* Dossier Link */}
                          <Link
                            href={`/customers/${c.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#002236]/5 hover:bg-[#002236] hover:text-white text-[#002236] text-[11px] font-semibold transition-colors"
                            title="Buka Dossier"
                          >
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PAGINATION CONTROLS (Screenshot 4 Fix) */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* WhatsApp Pitch Modal */}
      <WhatsAppPitchModal
        isOpen={!!pitchCustomer}
        onClose={() => setPitchCustomer(null)}
        customer={pitchCustomer}
      />

      {/* CRM Update Status & PIC Modal */}
      <CrmUpdateModal
        isOpen={!!updateCustomer}
        onClose={() => setUpdateCustomer(null)}
        customer={updateCustomer}
        users={users}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => router.refresh()}
        users={users as any}
        currentUser={currentUser}
      />
    </div>
  );
}
