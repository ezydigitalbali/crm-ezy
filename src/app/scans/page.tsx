import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import ScanConsoleClient from "@/components/scans/ScanConsoleClient";
import { Radar, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ScansPage() {
  const sessionUser = await getSessionUser();

  if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#1C1B18]">Akses Terbatas: Khusus Management</h2>
        <p className="text-xs text-[#1C1B18]/60">
          Operasi engine discovery OSM & SearXNG hanya dapat dijalankan oleh Superadmin dan Head. Anda saat ini login sebagai <strong className="text-[#002236]">{sessionUser.name} ({sessionUser.role})</strong>.
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

  const [totalCustomers, scanJobs] = await Promise.all([
    prisma.customer.count(),
    prisma.scanJob.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
    }),
  ]);

  const serializedJobs = scanJobs.map((j) => ({
    id: j.id,
    type: j.type,
    status: j.status,
    total: j.total,
    processed: j.processed,
    successful: j.successful,
    needs_review: j.needs_review,
    failed: j.failed,
    created_by: j.created_by,
    started_at: j.started_at ? j.started_at.toISOString() : null,
    completed_at: j.completed_at ? j.completed_at.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Radar size={22} className="text-[#FF7800]" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            Scan Operations & Intelligence Engine
          </h2>
        </div>
        <p className="text-xs text-[#1C1B18]/60 mt-1">
          Automated multi-layered discovery via OpenStreetMap and SearXNG metasearch layer.
        </p>
      </div>

      <ScanConsoleClient
        recentJobs={serializedJobs}
        totalCustomers={totalCustomers}
      />
    </div>
  );
}
