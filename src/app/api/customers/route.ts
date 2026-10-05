import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      business_name,
      contact_name,
      phone,
      email,
      address,
      city = "Badung",
      province = "Bali",
      business_category,
      lead_status = "NEW_LEAD",
      assigned_to_id,
      offering_value,
      deal_value,
      closing_services,
      lead_notes,
      website_url,
      instagram_username,
    } = body;

    if (!business_name || !business_name.trim()) {
      return NextResponse.json(
        { error: "Nama bisnis / prospek wajib diisi." },
        { status: 400 }
      );
    }

    // Role-based Assignment Rules:
    // 1. Sales: Selalu otomatis di-assign ke dirinya sendiri
    // 2. Superadmin / Head: Bebas memilih (diri sendiri, sales tertentu, atau unassigned/null)
    let finalAssignedToId: string | null = null;

    if (sessionUser.role === "SALES") {
      finalAssignedToId = sessionUser.id;
    } else {
      // SUPERADMIN atau HEAD
      if (assigned_to_id && assigned_to_id.trim() !== "" && assigned_to_id !== "UNASSIGNED") {
        finalAssignedToId = assigned_to_id;
      } else {
        finalAssignedToId = null;
      }
    }

    // Format closing services
    const closingServicesStr = Array.isArray(closing_services)
      ? closing_services.join(",")
      : typeof closing_services === "string"
      ? closing_services
      : null;

    const parsedOffering = offering_value !== undefined && offering_value !== null && offering_value !== ""
      ? parseFloat(String(offering_value))
      : null;

    const parsedDeal = deal_value !== undefined && deal_value !== null && deal_value !== ""
      ? parseFloat(String(deal_value))
      : null;

    // Bersihkan username instagram jika mengandung '@'
    const cleanIgUsername = instagram_username
      ? instagram_username.trim().replace(/^@+/, "").replace(/\/+$/, "")
      : null;

    // Bersihkan website url jika ada
    let cleanWebsiteUrl = website_url ? website_url.trim() : null;
    let websiteDomain: string | null = null;
    if (cleanWebsiteUrl) {
      if (!/^https?:\/\//i.test(cleanWebsiteUrl)) {
        cleanWebsiteUrl = `https://${cleanWebsiteUrl}`;
      }
      try {
        const parsed = new URL(cleanWebsiteUrl);
        websiteDomain = parsed.hostname.replace(/^www\./, "");
      } catch {
        websiteDomain = cleanWebsiteUrl.replace(/^https?:\/\//i, "").split("/")[0];
      }
    }

    // 1. Buat record Customer bertag Organik
    const customer = await prisma.customer.create({
      data: {
        business_name: business_name.trim(),
        contact_name: contact_name?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || "Badung",
        province: province?.trim() || "Bali",
        country: "Indonesia",
        business_category: business_category?.trim() || "General",
        source: "ORGANIC",
        sister_company: "Organik",
        lead_status: lead_status as any,
        assigned_to_id: finalAssignedToId,
        offering_value: parsedOffering,
        deal_value: parsedDeal,
        closing_services: closingServicesStr,
        lead_notes: lead_notes?.trim() || null,
        last_contacted_at: lead_status !== "NEW_LEAD" ? new Date() : null,
        last_contacted_by: lead_status !== "NEW_LEAD" ? sessionUser.name : null,
      },
    });

    const finalWebStatus = body.website_status || (cleanWebsiteUrl ? "ACTIVE" : "NOT_FOUND");
    const finalIgStatus = body.instagram_status || (cleanIgUsername ? "ACTIVE" : "NOT_FOUND");
    const postsLast30 = finalIgStatus === "ACTIVE" ? 15 : finalIgStatus === "DORMANT" ? 2 : 0;

    // 2. Buat record Website (Langsung Terverifikasi Tanpa Perlu Scan)
    await prisma.website.create({
      data: {
        customer_id: customer.id,
        url: cleanWebsiteUrl,
        domain: websiteDomain,
        status: finalWebStatus as any,
        discovery_source: "MANUAL",
        confidence_score: 100,
        manually_verified: true,
        last_checked_at: new Date(),
      },
    });

    // 3. Buat record Instagram (Langsung Terverifikasi Tanpa Perlu Scan)
    await prisma.instagramProfile.create({
      data: {
        customer_id: customer.id,
        username: cleanIgUsername,
        profile_url: cleanIgUsername ? `https://instagram.com/${cleanIgUsername}` : null,
        status: finalIgStatus as any,
        posts_last_30_days: postsLast30,
        posts_last_90_days: postsLast30 * 3,
        last_post_at: finalIgStatus === "ACTIVE" ? new Date(Date.now() - 3 * 24 * 3600 * 1000) : null,
        discovery_source: "MANUAL",
        confidence_score: 100,
        manually_verified: true,
        last_checked_at: new Date(),
      },
    });

    // 4. Catat riwayat aktivitas (CustomerActivity)
    await prisma.customerActivity.create({
      data: {
        customer_id: customer.id,
        user_id: sessionUser.id,
        user_name: sessionUser.name,
        action_type: "CREATE_CUSTOMER",
        status_to: customer.lead_status,
        offering_value: customer.offering_value,
        deal_value: customer.deal_value,
        closing_services: customer.closing_services,
        notes: lead_notes?.trim() || `Data prospek baru ditambahkan secara manual (Organik) oleh ${sessionUser.name}`,
      },
    });

    // 5. Catat ke System AuditLog
    await prisma.auditLog.create({
      data: {
        action: "CUSTOMER_CREATED",
        entity: "Customer",
        entity_id: customer.id,
        customer_id: customer.id,
        user_name: sessionUser.name,
        metadata: JSON.stringify({
          business_name: customer.business_name,
          source: "ORGANIC",
          assigned_to_id: finalAssignedToId,
          role: sessionUser.role,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      customer,
      message: "Prospek baru berhasil disimpan ke database.",
    });
  } catch (err: any) {
    console.error("Error creating organic customer:", err);
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan saat menyimpan prospek baru." },
      { status: 500 }
    );
  }
}
