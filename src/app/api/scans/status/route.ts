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

    if (job && job.status === "RUNNING") {
      const lastUpdate = new Date(job.updated_at).getTime();
      if (Date.now() - lastUpdate > 180000) {
        // Job dianggap mati / timeout di serverless
        job = await prisma.scanJob.update({
          where: { id: job.id },
          data: { status: "FAILED", completed_at: new Date() },
        });
      }
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
