import { NextResponse } from "next/server";
import adminService from "@/lib/database/admin-service";

export async function GET() {
  try {
    // Get all admin users
    const admins = await adminService.getAllAdmins();
    
    return NextResponse.json({
      success: true,
      count: admins.length,
      admins: admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        department: admin.department,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
      })),
    });
  } catch (error) {
    console.error("Test admin API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch admin users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
