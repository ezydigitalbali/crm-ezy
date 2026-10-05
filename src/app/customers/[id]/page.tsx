import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import ManualVerificationSection from "@/components/customers/ManualVerificationSection";
import InstagramIcon from "@/components/ui/InstagramIcon";
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Sparkles,
  RefreshCw,
  Camera,
  Building2
} from "lucide-react";
import CustomerPitchButton from "@/components/customers/CustomerPitchButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

import CustomerCrmDossierCard from "@/components/customers/CustomerCrmDossierCard";

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const [customer, users] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: {
        assigned_to: true,
        activities: { orderBy: { created_at: "desc" }, take: 15 },
        website: {
          include: {
            checks: { orderBy: { checked_at: "desc" }, take: 5 },
          },
        },
        instagram: {
          include: {
            checks: { orderBy: { checked_at: "desc" }, take: 5 },
          },
        },
        website_candidates: true,
        instagram_candidates: true,
        audit_logs: { orderBy: { created_at: "desc" }, take: 5 },
      },
    }),
    prisma.user.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        specialty: true,
      },
    }),
  ]);

  if (!customer) {
    notFound();
  }

  const webStatus = (customer.website?.status || "NOT_FOUND").toLowerCase().replace("_", "-");
  const igStatus = (customer.instagram?.status || "NOT_FOUND").toLowerCase().replace("_", "-");

  const lastPostDate = customer.instagram?.last_post_at ? new Date(customer.instagram.last_post_at) : null;
  const lastPostDays = lastPostDate 
    ? Math.round((Date.now() - lastPostDate.getTime()) / (1000 * 3600 * 24))
    : null;

  // Opportunity summary logic
  const isHighWebsiteOpp = customer.website?.status === "NOT_FOUND" && customer.instagram?.status === "ACTIVE";
  const isSocialOpp = customer.website?.status === "ACTIVE" && (customer.instagram?.status === "INACTIVE" || customer.instagram?.status === "DORMANT");
  
  const cat = (customer.business_category || "").toLowerCase();
  const isPropertyProduction = 
    cat.includes("real estate") ||
    cat.includes("property") ||
    cat.includes("villa") ||
    cat.includes("resort") ||
    cat.includes("hotel") ||
    cat.includes("architecture");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1B18]/60 hover:text-[#FF7800] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Customer Directory</span>
      </Link>

      {/* Header Dossier */}
      <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
              {customer.business_name}
            </h2>
            <span className="text-xs font-semibold text-[#1A75FF] bg-[#1A75FF]/10 px-2.5 py-0.5 rounded">
              {customer.business_category || "General Business"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c25900] bg-[#FF7800]/10 border border-[#FF7800]/30 px-3 py-0.5 rounded-full">
              <Building2 size={13} className="text-[#FF7800]" />
              <span>Sister Company: {customer.sister_company || "EZY Property"}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#1C1B18]/65 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#1C1B18]/40" />
              <span>{customer.address ? `${customer.address}, ` : ""}{customer.city || "Indonesia"}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-1.5 font-number">
                <Phone size={13} className="text-[#1C1B18]/40" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-[#1C1B18]/40" />
                <span>{customer.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          <CustomerPitchButton 
            customer={{
              id: customer.id,
              business_name: customer.business_name,
              contact_name: customer.contact_name,
              phone: customer.phone,
              business_category: customer.business_category,
              sister_company: customer.sister_company,
              website_domain: customer.website?.domain,
              instagram_username: customer.instagram?.username,
              opportunity_type: isHighWebsiteOpp ? "website" : isPropertyProduction ? "production" : isSocialOpp ? "social" : "website"
            }}
          />
          <Link
            href="/scans"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors"
          >
            <RefreshCw size={13} />
            <span>Re-Scan</span>
          </Link>
        </div>
      </div>

      {/* Opportunity Pitch Banner */}
      {isHighWebsiteOpp && (
        <div className="bg-gradient-to-r from-[#FF7800]/10 via-[#FF7800]/5 to-transparent rounded-xl p-5 border border-[#FF7800]/30 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#FF7800] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c25900]">
              High Value Prospect — Website Development
            </h4>
            <p className="text-xs text-[#1C1B18]/80 mt-1 leading-relaxed">
              This business is actively maintaining audience engagement on Instagram (latest post{" "}
              <span className="font-number font-semibold text-[#FF7800]">{lastPostDays} days ago</span>) but does NOT have an official website. Strong candidate for a high-converting web presence proposal.
            </p>
          </div>
        </div>
      )}

      {isSocialOpp && (
        <div className="bg-[#1A75FF]/10 rounded-xl p-5 border border-[#1A75FF]/25 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#1A75FF] text-white flex items-center justify-center shrink-0 shadow-xs">
            <InstagramIcon size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#004dc7]">
              Social Media Management Opportunity
            </h4>
            <p className="text-xs text-[#1C1B18]/80 mt-1 leading-relaxed">
              Official website is active and reachable, but Instagram has become dormant (no post for over{" "}
              <span className="font-number font-semibold">{lastPostDays} days</span>). High potential for social reactivation and content production services.
            </p>
          </div>
        </div>
      )}

      {isPropertyProduction && (
        <div className="bg-[#002236]/8 rounded-xl p-5 border border-[#002236]/20 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#002236] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002236]">
              Production Opportunity — Real Estate & Property Media
            </h4>
            <p className="text-xs text-[#1C1B18]/80 mt-1 leading-relaxed">
              This business belongs to the Property / Villa / Real Estate sector ({customer.business_category || "Property"}). High-value candidate for Architectural Photography, Drone Videography, and 3D Virtual Walkthrough Media Production.
            </p>
          </div>
        </div>
      )}

      {/* CRM Sales Lead Management Card */}
      <CustomerCrmDossierCard
        customer={{
          id: customer.id,
          business_name: customer.business_name,
          contact_name: customer.contact_name,
          phone: customer.phone,
          lead_status: customer.lead_status,
          assigned_to_id: customer.assigned_to_id,
          assigned_to_name: customer.assigned_to?.name || null,
          last_contacted_at: customer.last_contacted_at ? customer.last_contacted_at.toISOString() : null,
          last_contacted_by: customer.last_contacted_by,
          lead_notes: customer.lead_notes,
          business_category: customer.business_category,
          sister_company: customer.sister_company,
          website_domain: customer.website?.domain,
          instagram_username: customer.instagram?.username,
        }}
        activities={customer.activities.map((a) => ({
          id: a.id,
          user_name: a.user_name,
          action_type: a.action_type,
          status_from: a.status_from,
          status_to: a.status_to,
          notes: a.notes,
          created_at: a.created_at.toISOString(),
        }))}
        users={users}
      />

      {/* Manual Verification Section (if candidates exist) */}
      <ManualVerificationSection
        customerId={customer.id}
        websiteCandidates={customer.website_candidates}
        instagramCandidates={customer.instagram_candidates}
      />

      {/* Two Column Dossier: Website on Left, Instagram on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website Card */}
        <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1B18]/8">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-[#1A75FF]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
                Website Presence
              </h3>
            </div>
            <StatusBadge type={`website-${webStatus}` as any} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                Official Domain
              </span>
              {customer.website?.domain ? (
                <a
                  href={customer.website.url || `https://${customer.website.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-number font-semibold text-sm text-[#1A75FF] hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <span>{customer.website.domain}</span>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[#1C1B18]/60 italic mt-0.5 block">No domain found</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  HTTP Status
                </span>
                <span className="font-number text-xs font-semibold text-[#1C1B18]">
                  {customer.website?.http_status ? `${customer.website.http_status} OK` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  SSL Security
                </span>
                <span className="text-xs font-semibold flex items-center gap-1">
                  {customer.website?.ssl_valid ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={13} /> Valid HTTPS
                    </span>
                  ) : (
                    <span className="text-zinc-500">Unverified</span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Discovery Source
                </span>
                <span className="text-xs font-semibold text-[#1C1B18]">
                  {customer.website?.discovery_source || "None"}
                </span>
              </div>
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Confidence Score
                </span>
                <span className="font-number text-xs font-bold text-[#1C1B18]">
                  {customer.website?.confidence_score || 0} / 100
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1B18]/8 text-[11px] text-[#1C1B18]/50 flex items-center justify-between">
              <span>Last verified:</span>
              <span className="font-number">
                {customer.website?.last_checked_at
                  ? new Date(customer.website.last_checked_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Instagram Card */}
        <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1B18]/8">
            <div className="flex items-center gap-2">
              <InstagramIcon size={18} className="text-[#FF7800]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
                Instagram Presence
              </h3>
            </div>
            <StatusBadge type={`instagram-${igStatus}` as any} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                Instagram Handle
              </span>
              {customer.instagram?.username ? (
                <a
                  href={customer.instagram.profile_url || `https://instagram.com/${customer.instagram.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-number font-semibold text-sm text-[#1C1B18] hover:text-[#FF7800] flex items-center gap-1.5 mt-0.5"
                >
                  <span>@{customer.instagram.username}</span>
                  <ExternalLink size={12} className="text-[#1C1B18]/40" />
                </a>
              ) : (
                <span className="text-[#1C1B18]/60 italic mt-0.5 block">No profile identified</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Last Activity Post
                </span>
                <span className="text-xs font-semibold text-[#1C1B18]">
                  {lastPostDays !== null ? (
                    <span>
                      <strong className="font-number">{lastPostDays}</strong> days ago
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Posts / 30 Days
                </span>
                <span className="font-number text-xs font-bold text-[#1C1B18]">
                  {customer.instagram?.posts_last_30_days ?? 0} posts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Posts / 90 Days
                </span>
                <span className="font-number text-xs font-bold text-[#1C1B18]">
                  {customer.instagram?.posts_last_90_days ?? 0} posts
                </span>
              </div>
              <div>
                <span className="text-[#1C1B18]/45 block text-[11px] uppercase tracking-wider font-semibold">
                  Match Confidence
                </span>
                <span className="font-number text-xs font-bold text-[#1C1B18]">
                  {customer.instagram?.confidence_score || 0} / 100
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1B18]/8 text-[11px] text-[#1C1B18]/50 flex items-center justify-between">
              <span>Last checked:</span>
              <span className="font-number">
                {customer.instagram?.last_checked_at
                  ? new Date(customer.instagram.last_checked_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Timeline (Design Section 34 & PRD Section 67) */}
      <div className="bg-white rounded-xl p-6 border border-[#1C1B18]/10 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1B18]/80">
          Verification & Scan History
        </h3>

        <div className="space-y-3">
          {customer.website?.checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between py-2 border-b border-[#1C1B18]/5 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-number text-[#1C1B18]/50">
                  {new Date(check.checked_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="font-medium text-[#1C1B18]">
                  Website Status Verified:
                </span>
                <StatusBadge type={`website-${check.status.toLowerCase().replace("_", "-")}` as any} />
              </div>
              {check.http_status && (
                <span className="font-number text-[#1C1B18]/60 text-[11px]">
                  HTTP {check.http_status} ({check.response_time_ms || 200}ms)
                </span>
              )}
            </div>
          ))}

          {customer.instagram?.checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between py-2 border-b border-[#1C1B18]/5 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-number text-[#1C1B18]/50">
                  {new Date(check.checked_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="font-medium text-[#1C1B18]">
                  Instagram Activity Checked:
                </span>
                <StatusBadge type={`instagram-${check.status.toLowerCase().replace("_", "-")}` as any} />
              </div>
              <span className="font-number text-[#1C1B18]/60 text-[11px]">
                {check.posts_last_30_days} posts / 30d
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
