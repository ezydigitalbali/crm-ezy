import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Sesi telah berakhir" }, { status: 401 });
    }

    if (sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Superadmin dan Head yang berwenang melakukan penghapusan massal." },
        { status: 403 }
      );
    }

    const { all = false, ids = [] } = await req.json();

    if (!all && (!Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json(
        { error: "Pilih minimal satu customer untuk dihapus, atau konfirmasi hapus semua." },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (all) {
      // Hapus seluruh customer
      const res = await prisma.customer.deleteMany({});
      deletedCount = res.count;

      await prisma.auditLog.create({
        data: {
          user_name: sessionUser.name,
          action: "DELETE_ALL_CUSTOMERS",
          entity: "Customer",
          metadata: JSON.stringify({ deleted_count: deletedCount }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus seluruh data customer (${deletedCount} data).`,
        count: deletedCount,
      });
    } else {
      // Hapus berdasarkan daftar ID yang dipilih
      const res = await prisma.customer.deleteMany({
        where: { id: { in: ids } },
      });
      deletedCount = res.count;

      await prisma.auditLog.create({
        data: {
          user_name: sessionUser.name,
          action: "BULK_DELETE_CUSTOMERS",
          entity: "Customer",
          metadata: JSON.stringify({ deleted_count: deletedCount, ids }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil menghapus ${deletedCount} customer yang dipilih.`,
        count: deletedCount,
      });
    }
  } catch (error: any) {
    console.error("Bulk delete customers error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
