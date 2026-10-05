"use client";
import { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Download, ChevronRight, ExternalLink, Sparkles, Filter, Building2 } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";

interface OpportunityItem {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  business_category: string | null;
  sister_company?: string | null;
  website_status: string;
  website_domain: string | null;
  instagram_status: string;
  instagram_username: string | null;
  last_post_at: string | null;
  opportunity_type: "high-website" | "website" | "social" | "needs-review" | "presence" | "production" | "seo";
  confidence_score: number;
  is_property_production: boolean;
}

export default function OpportunityTableClient({
  items,
  initialTab = "high-website",
}: {
  items: OpportunityItem[];
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pitchCustomer, setPitchCustomer] = useState<PitchCustomerData | null>(null);

  const TABS = [
    {
      id: "high-website",
      label: "Website Dev (High Priority)",
      description: "No website detected, but actively posting on Instagram (≤ 30 days)",
      filter: (i: OpportunityItem) => i.opportunity_type === "high-website",
      badgeColor: "bg-[#FF7800] text-white",
    },
    {
      id: "production",
      label: "Production / Media (Property & Real Estate)",
      description: "Real Estate, Property, Villa & Resort businesses that qualify for Architectural Photo, Video & 3D Virtual Tour Production.",
      filter: (i: OpportunityItem) => i.is_property_production,
      badgeColor: "bg-[#002236] text-white",
    },
    {
      id: "seo",
      label: "SEO Candidates (Active Web)",
      description: "Businesses with an active official website & active Instagram ready for Google Ranking & SEO Optimization",
      filter: (i: OpportunityItem) => i.opportunity_type === "seo",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      id: "website",
      label: "All Website Leads",
      description: "All customer businesses without an active official website",
      filter: (i: OpportunityItem) => i.website_status === "NOT_FOUND" || i.website_status === "INACTIVE",
      badgeColor: "bg-[#FF7800]/20 text-[#c25900]",
    },
    {
      id: "social",
      label: "Social Media / Content",
      description: "Website is active, but Instagram is cooling, inactive, or dormant",
      filter: (i: OpportunityItem) => i.opportunity_type === "social",
      badgeColor: "bg-[#1A75FF]/20 text-[#004dc7]",
    },
    {
      id: "needs-review",
      label: "Needs Review",
      description: "Candidates found requiring staff confirmation",
      filter: (i: OpportunityItem) => i.website_status === "NEEDS_REVIEW" || i.instagram_status === "NEEDS_REVIEW",
      badgeColor: "bg-[#002236]/20 text-[#002236]",
    },
  ];

  const currentTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];
  const filteredItems = items.filter(currentTabConfig.filter);

  // Export functions using SheetJS
  const handleExport = (format: "xlsx" | "csv") => {
    const exportData = filteredItems.map((item) => {
      const days = item.last_post_at
        ? Math.round((Date.now() - new Date(item.last_post_at).getTime()) / (1000 * 3600 * 24))
        : null;

      return {
        "Business Name": item.business_name,
        "Sister Company": item.sister_company || "EZY Property",
        "Contact Person": item.contact_name || "-",
        "Phone": item.phone || "-",
        "Email": item.email || "-",
        "City": item.city || "-",
        "Category": item.business_category || "-",
        "Website Status": item.website_status,
        "Website Domain": item.website_domain || "-",
        "Instagram Status": item.instagram_status,
        "Instagram Handle": item.instagram_username ? `@${item.instagram_username}` : "-",
        "Last Instagram Post": days !== null ? `${days} days ago` : "-",
        "Opportunity Type": item.opportunity_type.toUpperCase(),
        "Confidence Score": item.confidence_score,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Opportunities");

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `ezy_opportunities_${activeTab}_${dateStr}.${format}`;

    if (format === "xlsx") {
      XLSX.writeFile(workbook, fileName);
    } else {
      XLSX.writeFile(workbook, fileName, { bookType: "csv" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1C1B18]/10 pb-3">
        {TABS.map((tab) => {
          const count = items.filter(tab.filter).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#002236] text-white shadow-xs"
                  : "bg-white text-[#1C1B18]/70 border border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-number font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-[#1C1B18]/10 text-[#1C1B18]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description & Export Toolbar (Design Section 42) */}
      <div className="bg-white rounded-xl p-4 border border-[#1C1B18]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-[#1C1B18]">
            {currentTabConfig.description}
          </span>
          <p className="text-[11px] text-[#1C1B18]/50 mt-0.5">
            Total target prospects: <strong className="font-number text-[#1C1B18]">{filteredItems.length}</strong> businesses
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleExport("xlsx")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export XLSX</span>
            <span className="font-number font-bold text-[10px] ml-0.5 opacity-90">({filteredItems.length})</span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#1C1B18]/25 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1C1B18]/10 bg-[#FCFBF0]/70 text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-3">Sister Company</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Website</th>
                <th className="py-3 px-3">Instagram</th>
                <th className="py-3 px-3">Last Post</th>
                <th className="py-3 px-3">Opportunity</th>
                <th className="py-3 px-4 text-right">Pitch & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/8 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#1C1B18]/50">
                    No opportunities in this category.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const days = item.last_post_at
                    ? Math.round((Date.now() - new Date(item.last_post_at).getTime()) / (1000 * 3600 * 24))
                    : null;

                  return (
                    <tr key={item.id} className="h-[56px] hover:bg-[#FCFBF0]/70 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-[#1C1B18]">
                        <Link
                          href={`/customers/${item.id}`}
                          className="font-semibold text-xs text-[#1C1B18] hover:text-[#FF7800] block truncate max-w-[200px]"
                        >
                          {item.business_name}
                        </Link>
                        <span className="text-[11px] text-[#1C1B18]/50 block">
                          {item.business_category || "Business"}
                        </span>
                      </td>

                      {/* Sister Company */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FF7800]/10 text-[#c25900] border border-[#FF7800]/25 truncate max-w-[140px]">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate">{item.sister_company || "EZY Property"}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-[#1C1B18]/70">
                        {item.city || "—"}
                      </td>

                      <td className="py-2.5 px-3 text-[#1C1B18]/80 font-number text-[11px]">
                        {item.phone || item.email || "—"}
                      </td>

                      <td className="py-2.5 px-3">
                        <StatusBadge
                          type={`website-${item.website_status.toLowerCase().replace("_", "-")}` as any}
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge
                            type={`instagram-${item.instagram_status.toLowerCase().replace("_", "-")}` as any}
                          />
                          {item.instagram_username && (
                            <span className="text-[11px] font-number text-[#1C1B18]/60 truncate max-w-[130px]">
                              @{item.instagram_username}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {days !== null ? (
                          <span>
                            <strong className="font-number font-semibold text-[#1C1B18]">{days}</strong>
                            <span className="text-[#1C1B18]/60 ml-1">days ago</span>
                          </span>
                        ) : (
                          <span className="text-[#1C1B18]/40">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          {item.is_property_production && (
                            <StatusBadge type="opportunity-production" label="Production Media" />
                          )}
                          {item.opportunity_type === "high-website" && (
                            <StatusBadge type="opportunity-high-website" label="Website Dev (High)" />
                          )}
                          {item.opportunity_type === "social" && (
                            <StatusBadge type="opportunity-social" label="Social / Content" />
                          )}
                          {item.opportunity_type === "website" && !item.is_property_production && (
                            <StatusBadge type="opportunity-website" label="Website Dev" />
                          )}
                          {item.opportunity_type === "needs-review" && (
                            <StatusBadge type="needs-review" label="Needs Review" />
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPitchCustomer({
                              id: item.id,
                              business_name: item.business_name,
                              contact_name: item.contact_name,
                              phone: item.phone,
                              business_category: item.business_category,
                              sister_company: item.sister_company || "EZY Property",
                              website_domain: item.website_domain,
                              instagram_username: item.instagram_username,
                              opportunity_type: item.opportunity_type,
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366]/12 hover:bg-[#25D366] text-[#0f8b3c] hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            title="Buka Template & Chat WhatsApp"
                          >
                            <WhatsAppIcon size={12} />
                            <span>Chat WA</span>
                          </button>
                          <Link
                            href={`/customers/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#002236]/5 hover:bg-[#FF7800] hover:text-white text-[#002236] text-[11px] font-semibold transition-colors"
                          >
                            <span>Review</span>
                            <ChevronRight size={12} />
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

      {/* WhatsApp Pitch Modal */}
      <WhatsAppPitchModal
        isOpen={!!pitchCustomer}
        onClose={() => setPitchCustomer(null)}
        customer={pitchCustomer}
      />
    </div>
  );
}
