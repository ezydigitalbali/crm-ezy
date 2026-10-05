import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";
import { scanSingleCustomer } from "@/lib/scans/engine";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { jobId, scanType = "ALL", limit = 10 } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId diperlukan" }, { status: 400 });
    }

    const job = await prisma.scanJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Scan job tidak ditemukan" }, { status: 404 });
    }

    if (job.status !== "RUNNING") {
      return NextResponse.json({
        success: true,
        completed: true,
        job,
      });
    }

    const batchLimit = Math.min(Math.max(limit, 5), 20);

    const customers = await prisma.customer.findMany({
      skip: job.processed,
      take: batchLimit,
      include: { website: true, instagram: true },
      orderBy: { created_at: "asc" },
    });

    if (customers.length === 0 || job.processed >= job.total) {
      const completedJob = await prisma.scanJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          user_name: sessionUser?.name || job.created_by,
          action: `COMPLETED_SCAN_${job.type}`,
          entity: "ScanJob",
          entity_id: jobId,
          metadata: JSON.stringify({
            total: job.total,
            processed: job.processed,
            successful: job.successful,
            failed: job.failed,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        completed: true,
        job: completedJob,
      });
    }

    // Eksekusi paralel batch
    const results = await Promise.allSettled(
      customers.map((c) => scanSingleCustomer(c, scanType || job.type))
    );

    let batchSuccess = 0;
    let batchReview = 0;
    let batchFailed = 0;

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value.status === "SUCCESS") batchSuccess++;
        else if (r.value.status === "REVIEW") batchReview++;
        else batchFailed++;
      } else {
        batchFailed++;
      }
    }

    const newProcessed = job.processed + customers.length;
    const isCompleted = newProcessed >= job.total;

    const updatedJob = await prisma.scanJob.update({
      where: { id: jobId },
      data: {
        processed: newProcessed,
        successful: { increment: batchSuccess },
        needs_review: { increment: batchReview },
        failed: { increment: batchFailed },
        ...(isCompleted
          ? {
              status: "COMPLETED",
              completed_at: new Date(),
            }
          : {}),
      },
    });

    if (isCompleted) {
      await prisma.auditLog.create({
        data: {
          user_name: sessionUser?.name || job.created_by,
          action: `COMPLETED_SCAN_${job.type}`,
          entity: "ScanJob",
          entity_id: jobId,
          metadata: JSON.stringify({
            total: updatedJob.total,
            processed: updatedJob.processed,
            successful: updatedJob.successful,
            failed: updatedJob.failed,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      completed: isCompleted,
      job: updatedJob,
    });
  } catch (error: any) {
    console.error("Batch scan error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
