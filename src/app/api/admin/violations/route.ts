import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { CreateCaseRequest } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/admin/violations - Get all violations for admin panel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Extract filter parameters
    const status = searchParams.get("status");
    const violationType = searchParams.get("violationType");
    const search = searchParams.get("search");

  // Build filters
  const filters: import("@/lib/database/models").CaseFilters = {};
    if (status && status !== "all") filters.status = status as import("@/lib/database/models").Case["status"];
    if (violationType && violationType !== "all") filters.violationType = violationType as import("@/lib/database/models").Case["violationType"];
    if (search) {
      // Search in violation description or location - use a flexible filter shape for regex search
  const flexibleFilters: Record<string, unknown> = {}; 
  (flexibleFilters as Record<string, unknown>)["$or"] = [
        { violation: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
  // Merge flexibleFilters into filters for DB query handling which accepts extra props
  Object.assign(filters as Record<string, unknown>, flexibleFilters);
    }

    const result = await db.getCases(filters, page, limit);

    // Enrich with user data
    const enrichedData = await Promise.all(
      result.data.map(async (caseItem) => {
        const user = await db.getUserById(caseItem.userId);
        return {
          ...caseItem,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "unknown@example.com",
          numberPlate: user?.numberPlate || "N/A",
        } as unknown;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        data: enrichedData,
      },
    });
  } catch (error) {
    console.error("Error fetching violations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch violations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/violations - Create a new violation case
export async function POST(request: NextRequest) {
  try {
    const violationData = await request.json();

    // If admin provided a numberPlate instead of userId, try to resolve the user
    if (!violationData.userId && violationData.numberPlate) {
      const matched = await db.getUserByNumberPlate(violationData.numberPlate);
      if (matched) {
        violationData.userId = matched.id;
      } else {
        return NextResponse.json(
          { success: false, error: `No user found for number plate ${violationData.numberPlate}` },
          { status: 404 }
        );
      }
    }

    // Validate required fields
    if (!violationData.userId || !violationData.violationType || !violationData.proofUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (userId|violationType|proofUrl)" },
        { status: 400 }
      );
    }

    // Create case data
    const caseData: CreateCaseRequest = {
      userId: violationData.userId,
      violationType: violationData.violationType,
      violation: violationData.description || violationData.violation,
      fine: violationData.fine || 0,
      proofUrl: violationData.proofUrl,
      location: violationData.location,
      date: violationData.dateTime || new Date().toISOString(),
      dueDate: violationData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      officerId: violationData.officerId,
      evidenceUrls: violationData.evidenceUrls || [],
    };

    const newCase = await db.createCase(caseData);

    // Create a user-facing query so the user is notified in their panel about the new case
    try {
      const subject = `New violation filed: ${newCase.violationType}`;
      const message = `A new violation case (ID: ${newCase.id}) has been created for your account. Fine: ${newCase.fine}. Please review your dashboard for details.`;
      await db.createQuery({
        userId: newCase.userId,
        caseId: newCase.id,
        subject,
        message,
        category: "violation_dispute",
        priority: "high",
        isUrgent: false,
      });
    } catch (e) {
      console.error("Failed to create notification query for user:", e);
      // non-fatal: proceed but include a warning
    }

    return NextResponse.json(
      {
        success: true,
        data: newCase,
        message: "Violation case created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating violation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create violation",
      },
      { status: 400 }
    );
  }
}
