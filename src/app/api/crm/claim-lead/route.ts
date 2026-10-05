import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Sesi telah berakhir. Silakan login kembali." }, { status: 401 });
    }

    const { customerId } = await req.json();
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID wajib disertakan." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Data customer tidak ditemukan." }, { status: 404 });
    }

    const previousSales = customer.assigned_to_id;

    // Update customer assignment to current user
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        assigned_to_id: sessionUser.id,
        lead_status: customer.lead_status === "NEW_LEAD" ? "NEW_LEAD" : customer.lead_status,
      },
      include: {
        assigned_to: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create activity record
    const noteText = previousSales && previousSales !== sessionUser.id
      ? `${sessionUser.name} mengambil alih prospek ini untuk proses pitching.`
      : `${sessionUser.name} meng-assign prospek ini ke diri sendiri untuk segera di-pitching.`;

    await prisma.customerActivity.create({
      data: {
        customer_id: customerId,
        user_id: sessionUser.id,
        user_name: sessionUser.name,
        action_type: "SELF_ASSIGN",
        status_from: customer.lead_status,
        status_to: customer.lead_status,
        notes: noteText,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "CLAIM_CUSTOMER_LEAD",
        entity: "Customer",
        entity_id: customerId,
        metadata: JSON.stringify({
          business_name: customer.business_name,
          assigned_to: sessionUser.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Prospek ${customer.business_name} berhasil di-assign ke ${sessionUser.name}!`,
      customer: updated,
    });
  } catch (error: any) {
    console.error("Claim lead error:", error);
    return NextResponse.json({ error: error.message || "Gagal meng-assign prospek." }, { status: 500 });
  }
}
