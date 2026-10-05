import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const body = await req.json();
    const { type, candidateId, action } = body;

    if (action === "CONFIRM") {
      if (type === "website") {
        const candidate = await prisma.websiteCandidate.findUnique({
          where: { id: candidateId },
        });
        if (candidate) {
          await prisma.website.upsert({
            where: { customer_id: customerId },
            create: {
              customer_id: customerId,
              domain: candidate.domain,
              url: candidate.url,
              status: "ACTIVE",
              confidence_score: 100,
              manually_verified: true,
              discovery_source: "MANUAL_VERIFIED",
              last_checked_at: new Date(),
            },
            update: {
              domain: candidate.domain,
              url: candidate.url,
              status: "ACTIVE",
              confidence_score: 100,
              manually_verified: true,
              last_checked_at: new Date(),
            },
          });
          await prisma.websiteCandidate.delete({ where: { id: candidateId } });
        }
      } else if (type === "instagram") {
        const candidate = await prisma.instagramCandidate.findUnique({
          where: { id: candidateId },
        });
        if (candidate) {
          await prisma.instagramProfile.upsert({
            where: { customer_id: customerId },
            create: {
              customer_id: customerId,
              username: candidate.username,
              profile_url: candidate.profile_url,
              display_name: candidate.display_name,
              status: "ACTIVE",
              confidence_score: 100,
              manually_verified: true,
              discovery_source: "MANUAL_VERIFIED",
              last_checked_at: new Date(),
            },
            update: {
              username: candidate.username,
              profile_url: candidate.profile_url,
              display_name: candidate.display_name,
              status: "ACTIVE",
              confidence_score: 100,
              manually_verified: true,
              last_checked_at: new Date(),
            },
          });
          await prisma.instagramCandidate.delete({ where: { id: candidateId } });
        }
      }

      await prisma.auditLog.create({
        data: {
          user_name: "Internal Staff",
          action: `CONFIRM_${type.toUpperCase()}`,
          entity: "Customer",
          entity_id: customerId,
          customer_id: customerId,
        },
      });
    } else if (action === "REJECT") {
      if (type === "website") {
        await prisma.websiteCandidate.delete({ where: { id: candidateId } });
      } else {
        await prisma.instagramCandidate.delete({ where: { id: candidateId } });
      }
      await prisma.auditLog.create({
        data: {
          user_name: "Internal Staff",
          action: `REJECT_${type.toUpperCase()}_CANDIDATE`,
          entity: "Customer",
          entity_id: customerId,
          customer_id: customerId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
