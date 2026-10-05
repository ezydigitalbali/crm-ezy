import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import CustomerTableClient from "@/components/customers/CustomerTableClient";
import { UploadCloud, Play, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  searchParams: Promise<{
    q?: string;
    website?: string;
    instagram?: string;
    opp?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = await searchParams;
  const initialSearch = resolvedParams.q || "";
  const initialWebsite = resolvedParams.website || "";
  const initialInstagram = resolvedParams.instagram || "";
  const initialOpportunity = resolvedParams.opp || "";

  const [customers, users] = await Promise.all([
    prisma.customer.findMany({
      include: {
        website: true,
        instagram: true,
        assigned_to: true,
      },
      orderBy: { business_name: "asc" },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            Customer Directory
          </h2>
          <p className="text-xs text-[#1C1B18]/60 mt-1">
            <span className="font-number font-bold text-[#1C1B18]">{customers.length}</span> total customer records in database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/imports"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#1C1B18]/15 text-xs font-semibold text-[#1C1B18] hover:bg-[#FCFBF0] transition-colors"
          >
            <UploadCloud size={14} />
            <span>Import CSV / XLSX</span>
          </Link>
          <Link
            href="/scans"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FF7800] text-white text-xs font-semibold hover:bg-[#e66c00] transition-colors shadow-xs"
          >
            <Play size={14} fill="currentColor" />
            <span>Run New Scan</span>
          </Link>
        </div>
      </div>

      {/* Interactive Table Client */}
      <CustomerTableClient 
        customers={customers as any}
        users={users}
        initialSearch={initialSearch}
        initialWebsite={initialWebsite}
        initialInstagram={initialInstagram}
        initialOpportunity={initialOpportunity}
      />
    </div>
  );
}
