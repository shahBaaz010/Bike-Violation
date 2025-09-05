import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { CreateCaseRequest, CaseFilters } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/cases - Get all cases with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Extract filter parameters
    const filters: CaseFilters = {};

    const userId = searchParams.get("userId");
    if (userId) filters.userId = userId;

    const violationType = searchParams.get("violationType");
  if (violationType) filters.violationType = violationType as unknown as import("@/lib/database/models").Case["violationType"];

  const status = searchParams.get("status");
  if (status) filters.status = status as unknown as import("@/lib/database/models").Case["status"];

    const minFine = searchParams.get("minFine");
    if (minFine) filters.minFine = parseFloat(minFine);

    const maxFine = searchParams.get("maxFine");
    if (maxFine) filters.maxFine = parseFloat(maxFine);

    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get("dateTo");
    if (dateTo) filters.dateTo = dateTo;

    const isPaid = searchParams.get("isPaid");
    if (isPaid !== null) filters.isPaid = isPaid === "true";

    const isDisputed = searchParams.get("isDisputed");
    if (isDisputed !== null) filters.isDisputed = isDisputed === "true";

    const result = await db.getCases(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const caseData: CreateCaseRequest = await request.json();

    const newCase = await db.createCase(caseData);

    return NextResponse.json(
      {
        success: true,
        data: newCase,
        message: "Case created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create case",
      },
      { status: 400 }
    );
  }
}
