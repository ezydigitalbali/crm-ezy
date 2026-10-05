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
        { error: "Akses ditolak: Hanya Superadmin dan Head yang berwenang mengubah Sister Company secara massal." },
        { status: 403 }
      );
    }

    const {
      toSisterCompany,
      fromSisterCompany,
      ids = [],
      all = false,
    } = await req.json();

    if (!toSisterCompany || !toSisterCompany.trim()) {
      return NextResponse.json(
        { error: "Nama Sister Company tujuan wajib diisi." },
        { status: 400 }
      );
    }

    const cleanToSister = toSisterCompany.trim();
    let updatedCount = 0;

    if (all) {
      // Ubah semua customer
      const res = await prisma.customer.updateMany({
        data: { sister_company: cleanToSister },
      });
      updatedCount = res.count;
    } else if (fromSisterCompany && fromSisterCompany.trim()) {
      // Ubah semua customer yang memiliki Sister Company tertentu (misal: "Royal Hindia")
      const cleanFrom = fromSisterCompany.trim();
      const res = await prisma.customer.updateMany({
        where: { sister_company: cleanFrom },
        data: { sister_company: cleanToSister },
      });
      updatedCount = res.count;
    } else if (Array.isArray(ids) && ids.length > 0) {
      // Ubah customer yang dipilih
      const res = await prisma.customer.updateMany({
        where: { id: { in: ids } },
        data: { sister_company: cleanToSister },
      });
      updatedCount = res.count;
    } else {
      return NextResponse.json(
        { error: "Harap tentukan target customer (berdasarkan pilihan, Sister Company asal, atau semua)." },
        { status: 400 }
      );
    }

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "BULK_UPDATE_SISTER_COMPANY",
        entity: "Customer",
        metadata: JSON.stringify({
          from: fromSisterCompany || "selected/all",
          to: cleanToSister,
          updated_count: updatedCount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui Sister Company menjadi "${cleanToSister}" untuk ${updatedCount} customer.`,
      count: updatedCount,
    });
  } catch (error: any) {
    console.error("Bulk update customers error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
