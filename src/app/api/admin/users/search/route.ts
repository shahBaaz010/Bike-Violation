import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { User } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/admin/users/search - Search users by number plate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numberPlate = searchParams.get("numberPlate");
    const search = searchParams.get("search");

    if (!numberPlate && !search) {
      return NextResponse.json(
        { success: false, error: "Number plate or search term is required" },
        { status: 400 }
      );
    }

  let users: User[] = [];
  if (numberPlate) {
      // Search by exact number plate
      const user = await db.getUserByNumberPlate(numberPlate);
      users = user ? [user] : [];
    } else if (search) {
      // Search by name, email, or number plate
      const result = await db.getUsers({ search }, 1, 10);
      users = result.data;
    } else {
      users = [];
    }

    // Return only necessary user data for admin panel
    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
      numberPlate: user.numberPlate,
      address: user.address,
      isActive: user.isActive,
    }));

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search users" },
      { status: 500 }
    );
  }
}
