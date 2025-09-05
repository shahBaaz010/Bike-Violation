import { NextRequest, NextResponse } from "next/server";
import adminService from "@/lib/database/admin-service";
import type { AdminUser } from "@/types/violation";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate admin
    const admin = await adminService.authenticateAdmin(email, password);

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Determine client IP from headers (no request.ip available in this runtime)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp ?? undefined;

    // Generate session token (prefer crypto.randomUUID when available)
    // Use crypto.randomUUID when available (safe check)
    let tokenBase: string;
    try {
      if (typeof crypto !== "undefined" && typeof (crypto as unknown as { randomUUID?: () => string }).randomUUID === "function") {
        tokenBase = (crypto as unknown as { randomUUID: () => string }).randomUUID();
      } else {
        tokenBase = Math.random().toString(36).slice(2, 11);
      }
    } catch {
      tokenBase = Math.random().toString(36).slice(2, 11);
    }
    const token = `admin_token_${Date.now()}_${tokenBase}`;

    // Create session
    const session = await adminService.createAdminSession(
      admin.id,
      token,
      ip,
      request.headers.get("user-agent") ?? undefined
    );

    // Log activity
    await adminService.logAdminActivity({
      adminId: admin.id,
      action: "login",
      resource: "admin_panel",
      details: "Admin logged in successfully",
  ipAddress: ip,
  userAgent: request.headers.get("user-agent") ?? undefined,
    });

    // Return admin data (without password) and session token
    // Exclude password from returned admin object (shallow clone)
    // Build a safe admin object without password by selecting known fields
    const adminTyped = admin as AdminUser;
    const adminWithoutPassword = {
      id: adminTyped.id,
      email: adminTyped.email,
      firstName: adminTyped.firstName,
      lastName: adminTyped.lastName,
      role: adminTyped.role,
      department: adminTyped.department,
      permissions: adminTyped.permissions,
      isActive: adminTyped.isActive,
      lastLogin: adminTyped.lastLogin,
      createdAt: adminTyped.createdAt,
      updatedAt: adminTyped.updatedAt,
    };

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword,
      session: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Invalidate session
    const success = await adminService.invalidateSession(token);

    if (!success) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
