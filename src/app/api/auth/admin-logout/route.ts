import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set({ name: "admin_session", value: "", maxAge: 0, path: "/" });
  return res;
}


