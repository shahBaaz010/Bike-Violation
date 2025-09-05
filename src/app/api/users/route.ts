import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database/mongo";
import { CreateUserRequest, UserFilters } from "@/lib/database/models";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/users - Get all users with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Extract filter parameters
    const filters: UserFilters = {};

  const role = searchParams.get("role");
  if (role) filters.role = role as unknown as import("@/lib/database/models").User["role"];

    const isActive = searchParams.get("isActive");
    if (isActive !== null) filters.isActive = isActive === "true";

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const createdAfter = searchParams.get("createdAfter");
    if (createdAfter) filters.createdAfter = createdAfter;

    const createdBefore = searchParams.get("createdBefore");
    if (createdBefore) filters.createdBefore = createdBefore;

    const result = await db.getUsers(filters, page, limit);

    // Remove password from response
    const sanitizedData = result.data.map((user) => {
      const { password: _password, ...userWithoutPassword } = user;
      void _password;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        data: sanitizedData,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const userData: CreateUserRequest = await request.json();

    const user = await db.createUser(userData);

    // Remove password from response
  const { password: _password, ...userWithoutPassword } = user;
  void _password;

    return NextResponse.json(
      {
        success: true,
        data: userWithoutPassword,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 400 }
    );
  }
}
