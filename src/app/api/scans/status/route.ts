import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    let job = null;

    if (jobId) {
      job = await prisma.scanJob.findUnique({
        where: { id: jobId },
      });
    }

    if (!job) {
      // Cari job yang sedang running
      job = await prisma.scanJob.findFirst({
        where: { status: "RUNNING" },
        orderBy: { created_at: "desc" },
      });
    }

    if (!job) {
      // Ambil job terbaru yang pernah jalan
      job = await prisma.scanJob.findFirst({
        orderBy: { created_at: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    console.error("Scan status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
