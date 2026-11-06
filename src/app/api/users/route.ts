import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth/auth";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "SUPERADMIN" && sessionUser.role !== "HEAD")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
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

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Hanya Superadmin yang memiliki izin menambah akun tim/sales baru." },
        { status: 403 }
      );
    }

    const { name, email, password, role = "SALES", specialty } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: `User dengan email "${cleanEmail}" sudah terdaftar.` },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        role: role,
        specialty: specialty?.trim() || "Website & Social Media Specialist",
        is_active: true,
      },
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
        action: "CREATE_USER",
        entity: "User",
        entity_id: newUser.id,
        metadata: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }),
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat user" }, { status: 500 });
  }
}

