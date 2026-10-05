import { prisma } from "@/lib/db/prisma";
import OpportunityTableClient from "@/components/opportunities/OpportunityTableClient";
import { Target, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OpportunitiesPage({ searchParams }: Props) {
  const { tab = "high-website" } = await searchParams;

  const customers = await prisma.customer.findMany({
    include: {
      website: true,
      instagram: true,
    },
    orderBy: { business_name: "asc" },
  });

  const items = customers.map((c) => {
    const webStatus = c.website?.status || "NOT_FOUND";
    const igStatus = c.instagram?.status || "NOT_FOUND";

    const text = `${c.business_category || ""} ${c.business_name || ""}`.toLowerCase();
    const isPropertyProduction = 
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
      text.includes("penginapan") ||
      text.includes("guesthouse") ||
      text.includes("homestay") ||
      text.includes("realty") ||
      text.includes("living") ||
      text.includes("land") ||
      text.includes("tanah");

    let oppType: "high-website" | "website" | "social" | "needs-review" | "presence" | "production" | "seo" = "presence";

    if (isPropertyProduction) {
      oppType = "production";
    } else if (webStatus === "NOT_FOUND" && igStatus === "ACTIVE") {
      oppType = "high-website";
    } else if (webStatus === "NOT_FOUND") {
      oppType = "website";
    } else if (webStatus === "ACTIVE" && (igStatus === "INACTIVE" || igStatus === "DORMANT" || igStatus === "COOLING")) {
      oppType = "social";
    } else if (webStatus === "ACTIVE" && igStatus === "ACTIVE") {
      oppType = "seo";
    } else if (webStatus === "NEEDS_REVIEW") {
      oppType = "needs-review";
    }

    return {
      id: c.id,
      business_name: c.business_name,
      contact_name: c.contact_name,
      phone: c.phone,
      email: c.email,
      city: c.city,
      business_category: c.business_category,
      website_status: webStatus,
      website_domain: c.website?.domain || null,
      instagram_status: igStatus,
      instagram_username: c.instagram?.username || null,
      last_post_at: c.instagram?.last_post_at ? c.instagram.last_post_at.toISOString() : null,
      opportunity_type: oppType,
      confidence_score: Math.max(c.website?.confidence_score || 0, c.instagram?.confidence_score || 0),
      is_property_production: isPropertyProduction,
      sister_company: c.sister_company || "EZY Property",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Target size={22} className="text-[#FF7800]" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            Sales Opportunities
          </h2>
        </div>
        <p className="text-xs text-[#1C1B18]/60 mt-1">
          High-intent prospect leads automatically segmented by digital presence gaps.
        </p>
      </div>

      {/* Interactive Tabs and Export Client */}
      <OpportunityTableClient items={items} initialTab={tab} />
    </div>
  );
}
