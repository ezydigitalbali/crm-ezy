import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const list = await prisma.sisterCompany.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, code, description } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama Sister Company wajib diisi" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const existing = await prisma.sisterCompany.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json({ error: "Sister Company dengan nama tersebut sudah ada" }, { status: 400 });
    }

    const created = await prisma.sisterCompany.create({
      data: {
        name: trimmedName,
        code: code?.trim() || trimmedName.toUpperCase().replace(/\s+/g, "_"),
        description: description?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        user_name: "Admin",
        action: "CREATE_SISTER_COMPANY",
        entity: "SisterCompany",
        entity_id: created.id,
        metadata: JSON.stringify({ name: created.name }),
      },
    });

    return NextResponse.json({ success: true, sisterCompany: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, code, description } = await req.json();
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: "ID dan Nama Sister Company wajib diisi" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const old = await prisma.sisterCompany.findUnique({ where: { id } });
    if (!old) {
      return NextResponse.json({ error: "Sister Company tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.sisterCompany.update({
      where: { id },
      data: {
        name: trimmedName,
        code: code?.trim() || undefined,
        description: description?.trim() || null,
      },
    });

    // If name changed, update all customers referencing old name
    if (old.name !== trimmedName) {
      await prisma.customer.updateMany({
        where: { sister_company: old.name },
        data: { sister_company: trimmedName },
      });
    }

    await prisma.auditLog.create({
      data: {
        user_name: "Admin",
        action: "UPDATE_SISTER_COMPANY",
        entity: "SisterCompany",
        entity_id: updated.id,
        metadata: JSON.stringify({ oldName: old.name, newName: updated.name }),
      },
    });

    return NextResponse.json({ success: true, sisterCompany: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID Sister Company wajib disertakan" }, { status: 400 });
    }

    const company = await prisma.sisterCompany.findUnique({ where: { id } });
    if (!company) {
      return NextResponse.json({ error: "Sister Company tidak ditemukan" }, { status: 404 });
    }

    // Check count of associated customers
    const count = await prisma.customer.count({
      where: { sister_company: company.name },
    });

    await prisma.sisterCompany.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user_name: "Admin",
        action: "DELETE_SISTER_COMPANY",
        entity: "SisterCompany",
        entity_id: id,
        metadata: JSON.stringify({ name: company.name, associatedCustomers: count }),
      },
    });

    return NextResponse.json({ success: true, countAffected: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
