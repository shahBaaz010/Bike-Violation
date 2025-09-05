import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/stats - Get comprehensive statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "users":
        const userStats = await db.getUserStats();
        return NextResponse.json({
          success: true,
          data: userStats,
        });

      case "cases":
        const caseStats = await db.getCaseStats();
        return NextResponse.json({
          success: true,
          data: caseStats,
        });

      case "queries":
        const queryStats = await db.getQueryStats();
        return NextResponse.json({
          success: true,
          data: queryStats,
        });

      case "all":
      default:
        const [allUserStats, allCaseStats, allQueryStats] = await Promise.all([
          db.getUserStats(),
          db.getCaseStats(),
          db.getQueryStats(),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            users: allUserStats,
            cases: allCaseStats,
            queries: allQueryStats,
          },
        });
    }
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
