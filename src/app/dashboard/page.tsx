import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import KpiCard from "@/components/dashboard/KpiCard";
import DigitalPresenceMatrix from "@/components/dashboard/DigitalPresenceMatrix";
import OpportunityCard from "@/components/dashboard/OpportunityCard";
import StatusBadge from "@/components/ui/StatusBadge";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Play, 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  Sparkles,
  UserCheck,
  Radar
} from "lucide-react";

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  const [
    totalCustomers,
    webActiveCount,
    webNotFoundCount,
    igActiveCount,
    customers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.website.count({ where: { status: "ACTIVE" } }),
    prisma.website.count({ where: { status: "NOT_FOUND" } }),
    prisma.instagramProfile.count({ where: { status: "ACTIVE" } }),
    prisma.customer.findMany({
      include: {
        website: true,
        instagram: true,
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  const isSuperadmin = sessionUser?.role === "SUPERADMIN" || sessionUser?.role === "HEAD";
  const myAssignedCount = sessionUser ? customers.filter(c => c.assigned_to_id === sessionUser.id).length : 0;

  // Calculate matrix & opportunity segments
  let highWebOpp = 0;
  let socialOpp = 0;
  let presenceOpp = 0;
  let propertyProductionOpp = 0;
  let needsReviewCount = 0;

  let webActive_igActive = 0;
  let webActive_igInactive = 0;
  let webActive_igNotFound = 0;
  let webMissing_igActive = 0;
  let webMissing_igInactive = 0;
  let webMissing_igNotFound = 0;

  customers.forEach((c) => {
    const webStatus = c.website?.status || "NOT_FOUND";
    const igStatus = c.instagram?.status || "NOT_FOUND";

    if (webStatus === "NEEDS_REVIEW" || igStatus === "NEEDS_REVIEW") {
      needsReviewCount++;
    }

    const isWebActive = webStatus === "ACTIVE";
    const isWebMissing = webStatus === "NOT_FOUND" || webStatus === "INACTIVE" || webStatus === "SCAN_FAILED";

    const isIgActive = igStatus === "ACTIVE";
    const isIgInactive = igStatus === "INACTIVE" || igStatus === "DORMANT" || igStatus === "COOLING";
    const isIgNotFound = igStatus === "NOT_FOUND" || igStatus === "SCAN_FAILED";

    if (isWebActive && isIgActive) webActive_igActive++;
    if (isWebActive && isIgInactive) webActive_igInactive++;
    if (isWebActive && isIgNotFound) webActive_igNotFound++;

    if (isWebMissing && isIgActive) {
      webMissing_igActive++;
      highWebOpp++;
    }
    if (isWebMissing && isIgInactive) webMissing_igInactive++;
    if (isWebMissing && isIgNotFound) {
      webMissing_igNotFound++;
      presenceOpp++;
    }

    if (isWebActive && (igStatus === "INACTIVE" || igStatus === "DORMANT")) {
      socialOpp++;
    }

    const text = `${c.business_category || ""} ${c.business_name || ""}`.toLowerCase();
    if (
      Boolean(c.closing_services?.includes("PRODUCTION")) ||
      text.includes("real estate") || 
      text.includes("property") || 
      text.includes("properti") || 
      text.includes("villa") || 
      text.includes("resort") || 
      text.includes("hotel") || 
      text.includes("architecture") ||
      text.includes("arsitektur") ||
      text.includes("interior") ||
      text.includes("realty") ||
      text.includes("living")
    ) {
      propertyProductionOpp++;
    }
  });

  const matrixData = {
    webActive_igActive,
    webActive_igInactive,
    webActive_igNotFound,
    webMissing_igActive,
    webMissing_igInactive,
    webMissing_igNotFound,
  };

  // High priority leads
  const highPriorityLeads = customers
    .filter((c) => (c.website?.status === "NOT_FOUND" || !c.website) && c.instagram?.status === "ACTIVE")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            Digital Presence Overview
          </h2>
          <p className="text-sm text-[#1C1B18]/60 mt-1">
            Monitor website discovery and Instagram activity metrics across all registered customers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperadmin && (
            <>
              <Link
                href="/scans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] shadow-xs transition-colors"
              >
                <Play size={14} fill="currentColor" />
                <span>Start Scan Job</span>
              </Link>
              <Link
                href="/imports"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors"
              >
                <span>Import Data</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Role-Aware Bar */}
      {isSuperadmin ? (
        /* Superadmin Helicopter Quick Bar */
        <div className="bg-gradient-to-r from-[#002236] to-[#013554] text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF7800] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              <Radar size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-xs text-white flex items-center gap-2">
                <span>Superadmin Helicopter View & Live Sales Tracker</span>
                <span className="bg-[#FF7800] text-white text-[10px] px-2 py-0.2 rounded-full font-bold">Aktif</span>
              </span>
              <p className="text-[11px] text-white/70 mt-0.5">
                Pantau beban kerja Joan, Sandra, Dimas, status negosiasi, dan riwayat pitching WhatsApp secara terpusat.
              </p>
            </div>
          </div>

          <Link
            href="/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-2xs shrink-0"
          >
            <span>Buka Sales Pipeline & Leaderboard →</span>
          </Link>
        </div>
      ) : (
        /* Sales Greeting Bar for Joan / Sandra / Dimas */
        <div className="bg-white border border-[#1C1B18]/12 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FF7800]/15 text-[#FF7800] flex items-center justify-center font-bold text-sm shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <span className="font-bold text-xs text-[#002236] flex items-center gap-2">
                <span>Halo, {sessionUser?.name || "Sales Specialist"}!</span>
                <span className="bg-[#002236] text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                  {sessionUser?.specialty?.split("&")[0].trim() || "Sales Specialist"}
                </span>
              </span>
              <p className="text-[11px] text-[#1C1B18]/60 mt-0.5">
                Anda memegang <strong className="text-[#FF7800] font-number">{myAssignedCount} prospek</strong>. Telusuri prospek di bawah dan klik "Ambil Prospek" jika ingin pitching sendiri!
              </p>
            </div>
          </div>

          <Link
            href={sessionUser ? `/pipeline?sales=${sessionUser.id}` : "/pipeline"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002236] text-white text-xs font-bold hover:bg-[#FF7800] transition-colors shadow-2xs shrink-0"
          >
            <span>Buka Pipeline Saya ({myAssignedCount}) →</span>
          </Link>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Customers"
          value={totalCustomers}
          subtext="Total records in database"
          icon={<Users size={18} />}
          accentColor="dark"
        />
        <KpiCard
          label="Websites Active"
          value={webActiveCount}
          subtext={`${((webActiveCount / (totalCustomers || 1)) * 100).toFixed(0)}% verified online`}
          icon={<Globe size={18} />}
          accentColor="blue"
        />
        <KpiCard
          label="Websites Not Found"
          value={webNotFoundCount}
          subtext="Potential website dev leads"
          icon={<TrendingUp size={18} />}
          accentColor="orange"
        />
        <KpiCard
          label="Instagram Active"
          value={igActiveCount}
          subtext="Posted within last 30 days"
          icon={<InstagramIcon size={18} />}
          accentColor="default"
        />
      </div>

      {/* Opportunity Highlights Row (3 columns: Website, Production, Social) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OpportunityCard
          title="High Website Opportunity"
          count={highWebOpp}
          tag="Website & SEO"
          description="Customers actively posting on Instagram (≤ 30 days) but currently have no detected official website."
          href="/opportunities?tab=high-website"
          accent="orange"
        />
        <OpportunityCard
          title="Production / Media Leads"
          count={propertyProductionOpp}
          tag="Property & Villa"
          description="Real Estate, Villa & Resort businesses that qualify for Architectural Photography, Video & Drone Tours."
          href="/opportunities?tab=production"
          accent="blue"
        />
        <OpportunityCard
          title="Social Media Opportunity"
          count={socialOpp}
          tag="Content & Sosmed"
          description="Customers with an active official website whose Instagram has become dormant or inactive (> 60 days)."
          href="/opportunities?tab=social"
          accent="blue"
        />
      </div>

      {/* Main Grid: Digital Presence Matrix + High Priority Action Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matrix on Left (7 cols) */}
        <div className="lg:col-span-7">
          <DigitalPresenceMatrix data={matrixData} />
        </div>

        {/* High Priority Leads Preview on Right (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
                  Top High Website Leads
                </h3>
                <p className="text-xs text-[#1C1B18]/50 mt-0.5">
                  No website + active Instagram posting
                </p>
              </div>
              <Link
                href="/opportunities"
                className="text-xs font-semibold text-[#FF7800] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-[#1C1B18]/8">
              {highPriorityLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#1C1B18]/50">
                  No high website leads currently found.
                </div>
              ) : (
                highPriorityLeads.map((lead) => {
                  const lastPostDays = lead.instagram?.last_post_at
                    ? Math.round((Date.now() - new Date(lead.instagram.last_post_at).getTime()) / (1000 * 3600 * 24))
                    : null;

                  return (
                    <div key={lead.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/customers/${lead.id}`}
                          className="font-semibold text-xs text-[#1C1B18] hover:text-[#FF7800] truncate block"
                        >
                          {lead.business_name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#1C1B18]/50">
                          <span>{lead.business_category || "Business"}</span>
                          <span>•</span>
                          <span className="font-medium text-[#c25900] bg-[#FF7800]/10 px-1.5 py-0.2 rounded text-[10px]">
                            {lead.sister_company || "EZY Property"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="block text-[11px] font-number text-emerald-600 font-semibold">
                            {lastPostDays !== null ? `${lastPostDays}d ago` : "Active"}
                          </span>
                          <span className="text-[10px] text-[#1C1B18]/40 block font-number">
                            @{lead.instagram?.username || "instagram"}
                          </span>
                        </div>
                        <Link
                          href={`/customers/${lead.id}`}
                          className="p-1.5 rounded-md hover:bg-[#FCFBF0] text-[#1C1B18]/60 hover:text-[#FF7800]"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-[#1C1B18]/8 flex items-center justify-between text-xs text-[#1C1B18]/60">
            <span>Pending Human Reviews:</span>
            <span className="font-number font-bold text-[#002236] bg-[#002236]/10 px-2 py-0.5 rounded">
              {needsReviewCount} records
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
