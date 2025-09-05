import { NextRequest, NextResponse } from "next/server";
import adminService from "@/lib/database/admin-service";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate session
    const session = await adminService.validateSession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Get admin data
    const admin = await adminService.getAdminById(session.adminId);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Return admin data (without password)
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword,
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Admin session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
}
