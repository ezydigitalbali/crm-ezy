import ImportConsoleClient from "@/components/imports/ImportConsoleClient";
import { UploadCloud, ShieldAlert, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const sessionUser = await getSessionUser();

  // Access control: Only Superadmin and Head can upload data
  if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-[#1C1B18]">Akses Terbatas: Khusus Management</h2>
        <p className="text-xs text-[#1C1B18]/60">
          Hanya Superadmin dan Head yang memiliki izin mengunggah database prospek baru ke sistem CRM. Anda login sebagai <strong className="text-[#002236]">{sessionUser.name} ({sessionUser.role})</strong>.
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

  const sisterCompanies = await prisma.sisterCompany.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <UploadCloud size={22} className="text-[#FF7800]" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            Customer Ingestion & Import (Superadmin Only)
          </h2>
        </div>
        <p className="text-xs text-[#1C1B18]/60 mt-1">
          Unggah database prospek bisnis baru via file Excel (.xlsx) atau CSV dengan pemetaan kolom otomatis & deduplikasi.
        </p>
      </div>

      <ImportConsoleClient sisterCompanies={sisterCompanies} />
    </div>
  );
}
