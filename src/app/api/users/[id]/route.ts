import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Hanya Superadmin yang memiliki izin mengedit akun user." }, { status: 403 });
    }

    const { id } = await params;
    const { name, email, password, role, specialty, is_active } = await req.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existing.email) {
        const dup = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (dup) {
          return NextResponse.json({ error: "Email sudah digunakan user lain" }, { status: 400 });
        }
        updateData.email = cleanEmail;
      }
    }
    if (password && password.trim().length >= 6) {
      updateData.password_hash = hashPassword(password.trim());
    }
    if (role) updateData.role = role;
    if (specialty !== undefined) updateData.specialty = specialty?.trim() || null;
    if (typeof is_active === "boolean") updateData.is_active = is_active;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
        is_active: true,
        created_at: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "UPDATE_USER",
        entity: "User",
        entity_id: updated.id,
        metadata: JSON.stringify({ name: updated.name, role: updated.role, is_active: updated.is_active }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Hanya Superadmin yang memiliki izin menghapus akun user." }, { status: 403 });
    }

    const { id } = await params;
    if (id === sessionUser.id) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang login." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Set null assigned customers first to prevent orphan issues
    await prisma.customer.updateMany({
      where: { assigned_to_id: id },
      data: { assigned_to_id: null },
    });

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user_name: sessionUser.name,
        action: "DELETE_USER",
        entity: "User",
        entity_id: id,
        metadata: JSON.stringify({ name: existing.name, email: existing.email }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus user" }, { status: 500 });
  }
}

