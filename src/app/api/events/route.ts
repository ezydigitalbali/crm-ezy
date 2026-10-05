import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Gracefully handle browser telemetry, beacon, or extension event logging
  return NextResponse.json({ success: true, message: "Event received" }, { status: 200 });
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true }, { status: 200 });
}
