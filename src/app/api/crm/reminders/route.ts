import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth";
import { getExpiringFollowUps } from "@/lib/crm/getExpiringFollowUps";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getExpiringFollowUps(sessionUser.id, sessionUser.role);
  return NextResponse.json({
    success: true,
    count: items.length,
    items,
  });
}

