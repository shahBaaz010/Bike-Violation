import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/database/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
  try {
    const db = await getDb();
    const { ok, operationTime } = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    return NextResponse.json({
      success: true,
      data: {
        ok,
        operationTime,
        db: db.databaseName,
        collections: collections.map((c) => c.name),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}


