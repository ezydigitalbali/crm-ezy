import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

// GET single customer details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        website: true,
        instagram: true,
        assigned_to: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT / UPDATE single customer (Khusus SUPERADMIN, HEAD, atau Sales pemilik lead)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Sesi telah berakhir" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { website: true, instagram: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    const isSuperadminOrHead = sessionUser.role === "SUPERADMIN" || sessionUser.role === "HEAD";
    const isOwner = existing.assigned_to_id === sessionUser.id;

    if (!isSuperadminOrHead && !isOwner) {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Superadmin, Head, atau Sales yang ditugaskan yang dapat mengedit data ini." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      business_name,
      contact_name,
      phone,
      email,
      address,
      city,
      province,
      business_category,
      sister_company,
      lead_status,
      assigned_to_id,
      offering_value,
      deal_value,
      closing_services,
      lead_notes,
      website_domain,
      instagram_username,
    } = body;

    if (!business_name || !business_name.trim()) {
      return NextResponse.json({ error: "Nama bisnis wajib diisi" }, { status: 400 });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        business_name: business_name.trim(),
        contact_name: contact_name !== undefined ? (contact_name?.trim() || null) : existing.contact_name,
        phone: phone !== undefined ? (phone?.trim() || null) : existing.phone,
        email: email !== undefined ? (email?.trim() || null) : existing.email,
        address: address !== undefined ? (address?.trim() || null) : existing.address,
        city: city !== undefined ? (city?.trim() || null) : existing.city,
        province: province !== undefined ? (province?.trim() || null) : existing.province,
        business_category: business_category !== undefined ? (business_category?.trim() || null) : existing.business_category,
        sister_company: sister_company !== undefined ? (sister_company?.trim() || null) : existing.sister_company,
        lead_status: lead_status || existing.lead_status,
        assigned_to_id: isSuperadminOrHead && assigned_to_id !== undefined
          ? (assigned_to_id === "UNASSIGNED" || !assigned_to_id ? null : assigned_to_id)
          : existing.assigned_to_id,
        offering_value: offering_value !== undefined
          ? (offering_value === null || offering_value === "" ? null : parseFloat(String(offering_value)))
          : existing.offering_value,
        deal_value: deal_value !== undefined
          ? (deal_value === null || deal_value === "" ? null : parseFloat(String(deal_value)))
          : existing.deal_value,
        closing_services: closing_services !== undefined
          ? (Array.isArray(closing_services) ? closing_services.join(",") : closing_services || null)
          : existing.closing_services,
        lead_notes: lead_notes !== undefined ? (lead_notes?.trim() || null) : existing.lead_notes,
      },
    });

    // Update Website jika diberikan
    if (website_domain !== undefined) {
      const cleanDomain = website_domain ? website_domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "") : null;
      if (existing.website) {
        await prisma.website.update({
          where: { customer_id: id },
          data: {
            domain: cleanDomain,
            url: cleanDomain ? `https://${cleanDomain}` : null,
            status: cleanDomain ? "ACTIVE" : "NOT_FOUND",
            manually_verified: true,
            last_checked_at: new Date(),
          },
        });
      } else if (cleanDomain) {
        await prisma.website.create({
          data: {
            customer_id: id,
            domain: cleanDomain,
            url: `https://${cleanDomain}`,
            status: "ACTIVE",
            manually_verified: true,
            discovery_source: "MANUAL",
            confidence_score: 100,
            last_checked_at: new Date(),
          },
        });
      }
    }

    // Update Instagram jika diberikan
    if (instagram_username !== undefined) {
      const cleanIg = instagram_username ? instagram_username.trim().replace(/^@+/, "").replace(/\/+$/, "") : null;
      if (existing.instagram) {
        await prisma.instagramProfile.update({
          where: { customer_id: id },
          data: {
            username: cleanIg,
            profile_url: cleanIg ? `https://www.instagram.com/${cleanIg}/` : null,
            status: cleanIg ? "ACTIVE" : "NOT_FOUND",
            manually_verified: true,
            last_checked_at: new Date(),
          },
        });
      } else if (cleanIg) {
        await prisma.instagramProfile.create({
          data: {
            customer_id: id,
            username: cleanIg,
            profile_url: `https://www.instagram.com/${cleanIg}/`,
            status: "ACTIVE",
            manually_verified: true,
            discovery_source: "MANUAL",
            confidence_score: 100,
            last_checked_at: new Date(),
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "UPDATE_CUSTOMER",
        entity: "Customer",
        entity_id: id,
        customer_id: id,
        metadata: JSON.stringify({
          updated_fields: Object.keys(body),
          sister_company: updatedCustomer.sister_company,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data customer berhasil diperbarui.",
      customer: updatedCustomer,
    });
  } catch (error: any) {
    console.error("Update customer error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE single customer (Khusus SUPERADMIN dan HEAD)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Sesi telah berakhir" }, { status: 401 });
    }

    if (sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Superadmin dan Head yang berwenang menghapus data customer." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, business_name: true, sister_company: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer tidak ditemukan" }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "DELETE_CUSTOMER",
        entity: "Customer",
        entity_id: id,
        metadata: JSON.stringify({
          business_name: customer.business_name,
          sister_company: customer.sister_company,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer "${customer.business_name}" berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
