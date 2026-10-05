import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { jobId } = await req.json().catch(() => ({}));

    if (jobId) {
      await prisma.scanJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          completed_at: new Date(),
        },
      });
    } else {
      // Hentikan semua scan job yang masih bertatus RUNNING
      await prisma.scanJob.updateMany({
        where: { status: "RUNNING" },
        data: {
          status: "FAILED",
          completed_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Proses scan berhasil dihentikan.",
    });
  } catch (error: any) {
    console.error("Cancel scan error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
