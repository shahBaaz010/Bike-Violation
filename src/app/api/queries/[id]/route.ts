import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { Query } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/queries/[id] - Get query by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;
  const query = await db.getQueryById(id);
    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: query });
  } catch (error) {
    console.error("Error fetching query:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch query" },
      { status: 500 }
    );
  }
}

// PUT /api/queries/[id] - Update query
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const updates: Partial<Query> = await request.json();
  const { id } = await params;
  const updated = await db.updateQuery(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Query not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Query updated successfully",
    });
  } catch (error) {
    console.error("Error updating query:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update query" },
      { status: 400 }
    );
  }
}

// DELETE /api/queries/[id] - Delete query
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;
  const success = await db.deleteQuery(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Query not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Query deleted successfully" });
  } catch (error) {
    console.error("Error deleting query:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete query" },
      { status: 500 }
    );
  }
}


