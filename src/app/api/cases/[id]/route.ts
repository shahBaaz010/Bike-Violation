import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { UpdateCaseRequest } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/cases/[id] - Get case by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;
  const caseRecord = await db.getCaseById(id);

    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseRecord,
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}

// PUT /api/cases/[id] - Update case
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const updates: UpdateCaseRequest = await request.json();

  const { id } = await params;
  const caseRecord = await db.updateCase(id, updates);

    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseRecord,
      message: "Case updated successfully",
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update case",
      },
      { status: 400 }
    );
  }
}

// DELETE /api/cases/[id] - Delete case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;
  const success = await db.deleteCase(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
