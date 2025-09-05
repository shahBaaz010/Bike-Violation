import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { Case as CaseModel, User } from "@/lib/database/models";
import { getCollection } from "@/lib/database/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/users/violations - Get violations for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get violations for the specific user
    const result = await db.getCases({ userId }, 1, 50); // Get up to 50 violations

    // Batch fetch user info for all userIds in the result to avoid N+1 queries
    const userIds = Array.from(new Set(result.data.map((c: CaseModel) => c.userId)));
    const usersCol = await getCollection<User>("users");
    const users = await usersCol.find({ id: { $in: userIds } }).toArray();
    const userById = new Map(users.map((u) => [u.id, u]));

    const enriched = result.data.map((c: CaseModel) => {
      const u = userById.get(c.userId);
      return {
        ...c,
        riderName: u ? u.name : null,
        numberPlate: u ? u.numberPlate : null,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error fetching user violations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch violations" },
      { status: 500 }
    );
  }
}
