import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { CreateQueryRequest, QueryFilters } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/queries - Get all queries with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Extract filter parameters
    const filters: QueryFilters = {};

    const userId = searchParams.get("userId");
    if (userId) filters.userId = userId;

    const category = searchParams.get("category");
  if (category) filters.category = category as unknown as import("@/lib/database/models").Query["category"];

  const status = searchParams.get("status");
  if (status) filters.status = status as unknown as import("@/lib/database/models").Query["status"];

  const priority = searchParams.get("priority");
  if (priority) filters.priority = priority as unknown as import("@/lib/database/models").Query["priority"];

    const assignedTo = searchParams.get("assignedTo");
    if (assignedTo) filters.assignedTo = assignedTo;

    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get("dateTo");
    if (dateTo) filters.dateTo = dateTo;

    const isUrgent = searchParams.get("isUrgent");
    if (isUrgent !== null) filters.isUrgent = isUrgent === "true";

    const hasAttachments = searchParams.get("hasAttachments");
    if (hasAttachments !== null)
      filters.hasAttachments = hasAttachments === "true";

    const result = await db.getQueries(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch queries" },
      { status: 500 }
    );
  }
}

// POST /api/queries - Create a new query
export async function POST(request: NextRequest) {
  try {
    const queryData: CreateQueryRequest = await request.json();

    const newQuery = await db.createQuery(queryData);

    return NextResponse.json(
      {
        success: true,
        data: newQuery,
        message: "Query created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating query:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create query",
      },
      { status: 400 }
    );
  }
}
