import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword, createSession } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Invalid email or account is inactive" }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session and audit log concurrently
    const [sessionResult] = await Promise.all([
      createSession(user.id),
      prisma.auditLog.create({
        data: {
          user_name: user.name,
          action: "USER_LOGIN",
          entity: "User",
          entity_id: user.id,
          metadata: JSON.stringify({ role: user.role }),
        },
      }).catch((err) => console.error("Audit log error:", err)),
    ]);

    const { token, expiresAt } = sessionResult;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
      },
    });

    response.cookies.set("ezy_session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
