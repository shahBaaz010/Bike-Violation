import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  // If we later add server sessions/cookies, clear them here
  const res = NextResponse.json({ success: true, message: "Logged out" });
  // Example cookie clear (no-op if not set)
  res.cookies.set({ name: "auth", value: "", path: "/", maxAge: 0 });
  return res;
}


