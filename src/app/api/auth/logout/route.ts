import { NextResponse } from "next/server";
import { deleteSession, getSessionUser } from "@/lib/auth/auth";

export async function POST() {
  try {
    await deleteSession();
    const response = NextResponse.json({ success: true });
    response.cookies.delete("ezy_session_token");
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
