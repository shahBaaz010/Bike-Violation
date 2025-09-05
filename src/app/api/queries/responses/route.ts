import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { CreateQueryResponseRequest } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/queries/responses - Create a new query response
export async function POST(request: NextRequest) {
  try {
    const responseData: CreateQueryResponseRequest = await request.json();

    // Validate required fields
    if (!responseData.queryId || !responseData.message) {
      return NextResponse.json(
        { success: false, error: "Query ID and message are required" },
        { status: 400 }
      );
    }

    const newResponse = await db.createQueryResponse(responseData);

    return NextResponse.json(
      {
        success: true,
        data: newResponse,
        message: "Response created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating query response:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create response",
      },
      { status: 400 }
    );
  }
}

// GET /api/queries/responses - Get responses for a specific query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get("queryId");

    if (!queryId) {
      return NextResponse.json(
        { success: false, error: "Query ID is required" },
        { status: 400 }
      );
    }

    const responses = await db.getQueryResponses(queryId);

    return NextResponse.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    console.error("Error fetching query responses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
