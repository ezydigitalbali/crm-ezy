import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/auth";

// Helper to extract city from Indonesian address text
function extractCityFromAddress(addr: string): string {
  if (!addr) return "Bali";
  const lower = addr.toLowerCase();
  if (lower.includes("canggu")) return "Canggu";
  if (lower.includes("denpasar") || lower.includes("sidakarya") || lower.includes("kesiman") || lower.includes("sanur") || lower.includes("panjer") || lower.includes("renon")) return "Denpasar";
  if (lower.includes("seminyak")) return "Seminyak";
  if (lower.includes("kuta utara") || lower.includes("kuta selatan") || lower.includes("kuta")) return "Kuta";
  if (lower.includes("ubud")) return "Ubud";
  if (lower.includes("uluwatu") || lower.includes("pecatu")) return "Uluwatu";
  if (lower.includes("jimbaran")) return "Jimbaran";
  if (lower.includes("nusa dua")) return "Nusa Dua";
  if (lower.includes("kerobokan")) return "Kerobokan";
  if (lower.includes("badung")) return "Badung";
  if (lower.includes("gianyar")) return "Gianyar";
  if (lower.includes("tabanan")) return "Tabanan";
  if (lower.includes("singaraja") || lower.includes("buleleng")) return "Singaraja";
  if (lower.includes("jakarta")) return "Jakarta";
  if (lower.includes("surabaya")) return "Surabaya";
  if (lower.includes("bandung")) return "Bandung";
  return "Bali";
}

// Helper to infer business category from business name
function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("kopi") || lower.includes("roastery") || lower.includes("espresso")) return "Cafe & Coffee";
  if (lower.includes("pizza") || lower.includes("burger") || lower.includes("resto") || lower.includes("restaurant") || lower.includes("kitchen") || lower.includes("warung") || lower.includes("grill") || lower.includes("bar") || lower.includes("bistro") || lower.includes("bakery") || lower.includes("diner")) return "Restaurant & F&B";
  if (lower.includes("villa") || lower.includes("resort") || lower.includes("hotel") || lower.includes("suites") || lower.includes("retreat") || lower.includes("stay") || lower.includes("homestay") || lower.includes("guesthouse") || lower.includes("cottage")) return "Villa & Property";
  if (lower.includes("surf") || lower.includes("dive") || lower.includes("diving") || lower.includes("tour") || lower.includes("travel") || lower.includes("adventure") || lower.includes("rafting")) return "Tourism & Activity";
  if (lower.includes("spa") || lower.includes("wellness") || lower.includes("salon") || lower.includes("massage") || lower.includes("beauty")) return "Wellness & Spa";
  if (lower.includes("property") || lower.includes("realty") || lower.includes("estate") || lower.includes("arsitek") || lower.includes("interior")) return "Real Estate & Architecture";
  return "F&B / Retail";
}

export async function POST(req: Request) {
  try {
    // 1. Role verification: Only Superadmin and Head can upload data
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD") {
      return NextResponse.json({ 
        error: "Akses ditolak: Hanya Superadmin dan Head yang berwenang mengunggah file data ke sistem." 
      }, { status: 403 });
    }

    const { 
      rows, 
      duplicateStrategy = "SKIP", 
      sisterCompany: batchSisterCompany,
      columnMapping = {}
    } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "File tidak memiliki baris data untuk diimpor." }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    // Helper to find value from row with multiple candidate key names
    const getVal = (row: any, fieldKey: string, candidateKeys: string[]): string => {
      // 1. Explicit mapping from user
      if (columnMapping[fieldKey] && columnMapping[fieldKey] !== "NONE") {
        const val = row[columnMapping[fieldKey]];
        if (val !== undefined && val !== null) return String(val).trim();
      }

      // 2. Direct key match
      if (row[fieldKey] !== undefined && row[fieldKey] !== null) {
        return String(row[fieldKey]).trim();
      }

      // 3. Normalized key matching (case-insensitive & stripped symbols)
      const rowKeys = Object.keys(row);
      for (const cand of candidateKeys) {
        const targetClean = cand.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchedKey = rowKeys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === targetClean);
        if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
          const val = String(row[matchedKey]).trim();
          if (val) return val;
        }
      }

      return "";
    };

    for (const row of rows) {
      // Prioritize exact user's column: "Nama Perusahaan"
      let businessName = getVal(row, "business_name", [
        "nama perusahaan", "nama bisnis", "nama usaha", "nama pic client", "company", "perusahaan",
        "business name", "nama customer", "customer", "customer name", "client", "nama client",
        "nama", "name", "brand", "nama brand", "villa", "nama villa", "hotel", "resto", "restaurant"
      ]);

      // If still empty, check the first non-empty string column in the row
      if (!businessName) {
        for (const [key, val] of Object.entries(row)) {
          if (typeof val === "string" && val.trim().length > 1 && !key.toLowerCase().includes("id") && !key.toLowerCase().includes("no")) {
            businessName = val.trim();
            break;
          }
        }
      }

      if (!businessName) {
        skipped++;
        continue;
      }

      // Prioritize exact user's column: "Nama PIC Client"
      const contactName = getVal(row, "contact_name", [
        "nama pic client", "nama pic", "pic client", "pic", "nama contact", "contact name",
        "contact person", "owner", "nama owner", "manager", "pengelola", "nama kontak", "contact", "person"
      ]) || null;

      // Prioritize exact user's column: "Telepon"
      const phone = getVal(row, "phone", [
        "telepon", "no hp", "no. hp", "phone", "telp", "no telp", "no. telp", "nomor telepon",
        "no wa", "whatsapp", "wa", "no whatsapp", "kontak", "mobile", "contact number"
      ]) || null;

      // Prioritize exact user's column: "Alamat"
      const address = getVal(row, "address", [
        "alamat", "address", "jalan", "street", "domisili", "lokasi detail"
      ]) || null;

      // Smart City extraction
      let city = getVal(row, "city", [
        "kota", "city", "lokasi", "location", "area", "wilayah", "kabupaten", "kecamatan", "daerah"
      ]);
      if (!city && address) {
        city = extractCityFromAddress(address);
      }
      if (!city) city = "Bali";

      // Smart Category extraction
      let category = getVal(row, "category", [
        "kategori", "category", "jenis usaha", "tipe bisnis", "industry", "tipe", "sektor", "bidang", "jenis"
      ]);
      if (!category) {
        category = inferCategory(businessName);
      }

      const email = getVal(row, "email", [
        "email", "e-mail", "surel", "mail", "email address"
      ]) || null;

      const sisterCompany = (batchSisterCompany && batchSisterCompany !== "AUTO")
        ? batchSisterCompany
        : (getVal(row, "sister_company", [
            "sister company", "perusahaan sister", "sister_company", "asal database", "database", "source", "company"
          ]) || "EZY Property & Villas");

      const websiteUrl = getVal(row, "website", [
        "website", "web", "domain", "url", "link website", "situs"
      ]);

      const igHandle = getVal(row, "instagram", [
        "instagram", "ig", "instagram handle", "username", "username ig", "akun ig", "sosmed"
      ]);

      // Duplicate check: business_name + city (or phone if available)
      const existing = await prisma.customer.findFirst({
        where: {
          OR: [
            {
              business_name: { equals: businessName, mode: "insensitive" },
              city: { equals: city, mode: "insensitive" },
            },
            ...(phone ? [{ phone: { equals: phone } }] : []),
          ],
        },
      });

      if (existing) {
        if (duplicateStrategy === "SKIP") {
          skipped++;
          continue;
        } else if (duplicateStrategy === "MERGE") {
          await prisma.customer.update({
            where: { id: existing.id },
            data: {
              phone: phone || existing.phone,
              email: email || existing.email,
              contact_name: contactName || existing.contact_name,
              sister_company: sisterCompany || existing.sister_company,
              address: address || existing.address,
              business_category: category !== "General" ? category : existing.business_category,
            },
          });
          imported++;
          continue;
        }
      }

      // Create new customer
      const newCustomer = await prisma.customer.create({
        data: {
          business_name: businessName,
          contact_name: contactName,
          phone,
          email,
          address,
          city,
          province: "Bali",
          business_category: category,
          source: "EXCEL_IMPORT",
          sister_company: sisterCompany,
          lead_status: "NEW_LEAD",
        },
      });

      // Initialize website record
      let webClean = websiteUrl ? websiteUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "") : null;
      await prisma.website.create({
        data: {
          customer_id: newCustomer.id,
          domain: webClean || null,
          url: webClean ? `https://${webClean}` : null,
          status: webClean ? "ACTIVE" : "NOT_FOUND",
          discovery_source: webClean ? "EXCEL_IMPORT" : "PENDING_SCAN",
          confidence_score: webClean ? 90 : 0,
        },
      });

      // Initialize IG record
      let igClean = igHandle ? igHandle.replace(/^@/, "").trim() : null;
      await prisma.instagramProfile.create({
        data: {
          customer_id: newCustomer.id,
          username: igClean || null,
          profile_url: igClean ? `https://instagram.com/${igClean}` : null,
          status: igClean ? "ACTIVE" : "NOT_FOUND",
          discovery_source: igClean ? "EXCEL_IMPORT" : "PENDING_SCAN",
          confidence_score: igClean ? 90 : 0,
        },
      });

      imported++;
    }

    // Record import job
    await prisma.importJob.create({
      data: {
        file_name: "customer_batch_upload.xlsx",
        total_rows: rows.length,
        imported_rows: imported,
        skipped_rows: skipped,
        status: "COMPLETED",
      },
    });

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser?.name || "Superadmin",
        action: "IMPORT_CUSTOMER_BATCH",
        entity: "Customer",
        metadata: JSON.stringify({ total: rows.length, imported, skipped, actor: sessionUser?.name || "Superadmin" }),
      },
    });

    return NextResponse.json({ success: true, imported, skipped, total: rows.length });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
