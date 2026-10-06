import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import PipelineConsoleClient from "@/components/crm/PipelineConsoleClient";
import { TrendingUp, ShieldCheck, Users, Target } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ sales?: string }>;
}

export default async function PipelinePage({ searchParams }: Props) {
  const { sales = "ALL" } = await searchParams;

  const [customers, users, activities, sessionUser] = await Promise.all([
    prisma.customer.findMany({
      include: {
        assigned_to: true,
        website: true,
        instagram: true,
        activities: {
          orderBy: { created_at: "desc" },
          take: 3,
        },
      },
      orderBy: [
        { last_contacted_at: "desc" },
        { updated_at: "desc" },
      ],
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
    prisma.customerActivity.findMany({
      take: 25,
      orderBy: { created_at: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            business_name: true,
            sister_company: true,
            phone: true,
          },
        },
      },
    }),
    getSessionUser(),
  ]);

  const serializedUser = sessionUser
    ? {
        id: sessionUser.id,
        name: sessionUser.name,
        role: sessionUser.role,
        email: sessionUser.email,
        specialty: sessionUser.specialty,
      }
    : null;

  const pipelineCustomers = customers.map((c) => ({
    id: c.id,
    business_name: c.business_name,
    contact_name: c.contact_name,
    phone: c.phone,
    email: c.email,
    city: c.city,
    business_category: c.business_category,
    sister_company: c.sister_company,
    lead_status: c.lead_status,
    assigned_to_id: c.assigned_to_id,
    assigned_to_name: c.assigned_to?.name || null,
    last_contacted_at: c.last_contacted_at ? c.last_contacted_at.toISOString() : null,
    last_contacted_by: c.last_contacted_by || null,
    lead_notes: c.lead_notes || (c.activities[0]?.notes ?? null),
    website_domain: c.website?.domain || null,
    instagram_username: c.instagram?.username || null,
    opportunity_type: c.website?.status === "NOT_FOUND" ? "website" : "social",
    activities_count: c.activities.length,
    offering_value: c.offering_value,
    deal_value: c.deal_value,
    closing_services: c.closing_services,
  }));

  const serializedActivities = activities.map((act) => ({
    id: act.id,
    customer_id: act.customer_id,
    business_name: act.customer?.business_name || "Unknown Business",
    sister_company: act.customer?.sister_company || null,
    user_name: act.user_name || "System",
    action_type: act.action_type,
    status_from: act.status_from,
    status_to: act.status_to,
    offering_value: act.offering_value,
    deal_value: act.deal_value,
    closing_services: act.closing_services,
    notes: act.notes,
    created_at: act.created_at.toISOString(),
  }));

  const isSalesUser = sessionUser?.role === "SALES";

  return (
    <div className="space-y-6">
      {/* Header (Role Aware: Sales CRM Pipeline for Sales, Helicopter View for Management) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp size={22} className="text-[#FF7800]" />
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
              {isSalesUser ? "Sales CRM Pipeline" : "Sales CRM Pipeline & Helicopter View"}
            </h2>
            {isSalesUser ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF7800]/15 text-[#FF7800] border border-[#FF7800]/30 text-[11px] font-bold shadow-2xs">
                <span>Pipeline Saya</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#002236] text-white text-[11px] font-bold shadow-2xs">
                <ShieldCheck size={12} className="text-[#FF7800]" />
                <span>Superadmin Helicopter View</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#1C1B18]/60 mt-1">
            {isSalesUser
              ? "Kelola daftar prospek Anda, riwayat pitching WhatsApp, negosiasi dan status deal closing secara real-time."
              : "Monitoring komprehensif performa seluruh sales (Joan, Sandra, Dimas), pantau riwayat pitching WhatsApp, aktivitas negosiasi & status deal closing secara real-time."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-[#1C1B18] text-xs font-semibold hover:bg-[#FCFBF0] transition-colors"
          >
            <Users size={14} />
            <span>Semua Customer</span>
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs"
          >
            <Target size={14} />
            <span>Peluang Pitching</span>
          </Link>
        </div>
      </div>

      {/* Main Pipeline Console */}
      <PipelineConsoleClient
        customers={pipelineCustomers}
        users={users}
        activities={serializedActivities}
        initialSales={sales}
        initialUser={serializedUser}
      />
    </div>
  );
}
