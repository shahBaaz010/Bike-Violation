import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/database/mongodb";
import { User, Case } from "@/lib/database/models";
import type { UpdateResult } from "mongodb";

// GET /api/admin/users/[userId] - Get user details with violations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
  const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

  const usersCollection = await getCollection<User>("users");
  const casesCollection = await getCollection<Case>("cases");
    
    // Get user details
  const user = (await usersCollection.findOne({ id: userId })) as User | null;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get user's violations
    const violations = (await casesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()) as Case[];
    
    // Calculate statistics
    const violationCount = violations.length;
    const totalFines = violations.reduce((sum, v) => sum + (v.fine || 0), 0);
    // note: Case model uses `status` (paid/resolved/etc.). Some older code used `paymentStatus` — treat paid by status === 'paid'
    const outstandingFines = violations
      .filter((v) => v.status !== "paid")
      .reduce((sum, v) => sum + (v.fine || 0), 0);
    const paidFines = violations
      .filter((v) => v.status === "paid")
      .reduce((sum, v) => sum + (v.fine || 0), 0);
    
    // Group violations by status
    const violationsByStatus = violations.reduce((acc, violation) => {
      const status = violation.status || "pending";
      if (!acc[status]) acc[status] = [];
      acc[status].push(violation);
      return acc;
    }, {} as Record<string, Case[]>);

    // Group violations by payment status (we treat paid by status === 'paid')
    const violationsByPayment = violations.reduce((acc, violation) => {
      const paymentStatus = violation.status === "paid" ? "paid" : "pending";
      if (!acc[paymentStatus]) acc[paymentStatus] = [];
      acc[paymentStatus].push(violation);
      return acc;
    }, {} as Record<string, Case[]>);
    
    // Get recent activity (last 10 violations)
    const recentViolations = violations.slice(0, 10);
    
  // Remove password from user object
  // Build response user object explicitly (avoid leaking password)
  const userEx = user as User & Partial<{ emailVerified: boolean; phoneVerified: boolean; status: string }>;
  const responseUser = {
    id: userEx.id,
    name: userEx.name,
    email: userEx.email,
    numberPlate: userEx.numberPlate,
    role: userEx.role,
    createdAt: userEx.createdAt,
    updatedAt: userEx.updatedAt,
    isActive: userEx.isActive !== false,
    emailVerified: userEx.emailVerified ?? false,
    phoneVerified: userEx.phoneVerified ?? false,
    status: userEx.status ?? "active",
    violationCount,
    totalFines,
    outstandingFines,
    paidFines,
    violationsByStatus,
    violationsByPayment,
    recentViolations,
  } as const;

  return NextResponse.json({
    success: true,
    data: { user: responseUser },
  });
    
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[userId] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
  const { userId } = await params;
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const usersCollection = await getCollection<User>("users");
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({ id: userId });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check for email/number plate conflicts if updating
    if (body.email || body.numberPlate) {
      const conflictQuery: Record<string, unknown> = { id: { $ne: userId } };
      
      if (body.email) {
        conflictQuery.email = body.email.toLowerCase();
      }
      
      if (body.numberPlate) {
        conflictQuery.numberPlate = body.numberPlate.toUpperCase();
      }
      
  const conflictingUser = await usersCollection.findOne(conflictQuery as Record<string, unknown>);
      if (conflictingUser) {
        return NextResponse.json(
          { success: false, error: "Email or number plate already exists" },
          { status: 409 }
        );
      }
    }
    
    // Prepare updates
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    
    // Handle different update types
    if (body.action === "suspend") {
      updates.status = "suspended";
      updates.suspendedAt = new Date().toISOString();
      updates.suspendedReason = body.reason || "Suspended by admin";
      updates.suspendedBy = body.adminId || "system";
    } else if (body.action === "activate") {
      updates.status = "active";
      updates.isActive = true;
      updates.suspendedAt = undefined;
      updates.suspendedReason = undefined;
      updates.suspendedBy = undefined;
    } else if (body.action === "deactivate") {
      updates.status = "inactive";
      updates.isActive = false;
    } else if (body.action === "verifyEmail") {
      updates.emailVerified = true;
    } else if (body.action === "verifyPhone") {
      updates.phoneVerified = true;
    } else {
      // General update - only allow specific fields
      const allowedFields = [
        "name", "email", "numberPlate", "phoneNumber", "address", 
        "role", "notes", "status", "isActive", "emailVerified", "phoneVerified"
      ];
      
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === "email") {
            updates[field] = body[field].toLowerCase();
          } else if (field === "numberPlate") {
            updates[field] = body[field].toUpperCase();
          } else {
            updates[field] = body[field];
          }
        }
      });
    }
    
    // Update user
    const result = (await usersCollection.updateOne(
      { id: userId },
      { $set: updates }
    )) as UpdateResult;
    
    if (!result.matchedCount || result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get updated user
    const updatedUser = (await usersCollection.findOne({ id: userId })) as User | null;
    const updatedEx = updatedUser as User & Partial<{ emailVerified: boolean; phoneVerified: boolean; status: string }>;
    const responseUser = {
      id: updatedEx.id,
      name: updatedEx.name,
      email: updatedEx.email,
      numberPlate: updatedEx.numberPlate,
      role: updatedEx.role,
      createdAt: updatedEx.createdAt,
      updatedAt: updatedEx.updatedAt,
      isActive: updatedEx.isActive !== false,
      emailVerified: updatedEx.emailVerified ?? false,
      phoneVerified: updatedEx.phoneVerified ?? false,
      status: updatedEx.status ?? "active",
    };

    return NextResponse.json({
      success: true,
      data: responseUser,
      message: "User updated successfully",
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
  const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }
    
  const usersCollection = await getCollection<User>("users");
  const casesCollection = await getCollection<Case>("cases");
    
    // Check if user exists
    const existingUser = (await usersCollection.findOne({ id: userId })) as User | null;
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has outstanding violations
    const outstandingViolations = await casesCollection.countDocuments({
      userId,
      status: { $ne: "paid" },
    });
    
    if (outstandingViolations > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete user with outstanding violations",
          outstandingViolations 
        },
        { status: 400 }
      );
    }
    
  // Delete user's cases first
  await casesCollection.deleteMany({ userId });
    
    // Delete user
    const result = await usersCollection.deleteOne({ id: userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
