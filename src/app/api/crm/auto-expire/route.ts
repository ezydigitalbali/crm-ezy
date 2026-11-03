import { NextResponse } from "next/server";
import { autoExpireStaleFollowUps } from "@/lib/crm/autoExpireFollowUps";
import { getSessionUser } from "@/lib/auth/auth";

export async function POST() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await autoExpireStaleFollowUps();
  return NextResponse.json({ success: true, result });
}

export async function GET() {
  const result = await autoExpireStaleFollowUps();
  return NextResponse.json({ success: true, result });
}

