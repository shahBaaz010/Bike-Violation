import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/database/mongodb";
import type {
  User,
  Case as CaseModel,
  CreateUserRequest,
} from "@/lib/database/models";
import type { UpdateResult } from "mongodb";

// Lightweight request types for this route
interface AdminUserResponse extends Omit<User, "password"> {
  violationCount: number;
  totalFines: number;
  outstandingFines: number;
  hasViolations: boolean;
  hasOutstandingFines: boolean;
}

interface BulkUpdateRequest {
  userIds: string[];
  action?: string;
  reason?: string;
  adminId?: string;
  role?: User["role"];
  updates?: Partial<User>;
}

type AdminUserUpdate = Partial<User> & {
  status?: string;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  suspendedBy?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  updatedAt?: string;
};

// GET /api/admin/users - Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    // Build filters from query params
    const filters: Record<string, unknown> = {};
    const search = searchParams.get("search");
    if (search) filters.search = search;
    const status = searchParams.get("status");
    if (status) filters.status = status;
    const role = searchParams.get("role");
    if (role) filters.role = role;
    const emailVerified = searchParams.get("emailVerified");
    if (emailVerified !== null) filters.emailVerified = emailVerified === "true";
    const phoneVerified = searchParams.get("phoneVerified");
    if (phoneVerified !== null) filters.phoneVerified = phoneVerified === "true";
    const hasViolations = searchParams.get("hasViolations");
    if (hasViolations !== null) filters.hasViolations = hasViolations === "true";
    const hasOutstandingFines = searchParams.get("hasOutstandingFines");
    if (hasOutstandingFines !== null) filters.hasOutstandingFines = hasOutstandingFines === "true";
    const registeredAfter = searchParams.get("registeredAfter");
    if (registeredAfter) filters.registeredAfter = registeredAfter;
    const registeredBefore = searchParams.get("registeredBefore");
    if (registeredBefore) filters.registeredBefore = registeredBefore;

  const usersCollection = await getCollection<User>("users");
  const casesCollection = await getCollection<CaseModel>("cases");

  // Use a flexible record for building the query and cast when calling Mongo APIs
  const query: Record<string, unknown> = {};

    if (filters.search && typeof filters.search === "string") {
      const regex = new RegExp(filters.search, "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { numberPlate: regex },
        { phoneNumber: regex },
      ];
    }

  if (filters.status && typeof filters.status === "string") query.status = filters.status;
  if (filters.role && typeof filters.role === "string") query.role = filters.role as User["role"];
  if (typeof filters.emailVerified === "boolean") query.emailVerified = filters.emailVerified as boolean;
  if (typeof filters.phoneVerified === "boolean") query.phoneVerified = filters.phoneVerified as boolean;

    if (filters.registeredAfter || filters.registeredBefore) {
      // storing createdAt as ISO strings, compare lexicographically or parse to Date if stored as Date
      const createdAtFilter: Record<string, string> = {};
      if (filters.registeredAfter && typeof filters.registeredAfter === "string") createdAtFilter.$gte = filters.registeredAfter;
      if (filters.registeredBefore && typeof filters.registeredBefore === "string") createdAtFilter.$lte = filters.registeredBefore;
      if (Object.keys(createdAtFilter).length) query.createdAt = createdAtFilter;
    }

      // If we need to filter by derived values (hasViolations / hasOutstandingFines)
      // we must enrich first across the full matched set to compute accurate totals.
      const needsEnrich = filters.hasViolations !== undefined || filters.hasOutstandingFines !== undefined;

      if (needsEnrich) {
        const allUsers = await usersCollection.find(query).sort({ createdAt: -1 }).toArray();
        const enrichedAll = await Promise.all(
          allUsers.map(async (user) => {
            const cases = await casesCollection.find({ userId: user.id }).toArray();

            const violationCount = cases.length;
            const totalFines = cases.reduce((sum, c) => sum + (c.fine ?? 0), 0);
            const outstandingFines = cases.filter((c) => c.status !== "paid").reduce((sum, c) => sum + (c.fine ?? 0), 0);

            const hasV = violationCount > 0;
            const hasOutstanding = outstandingFines > 0;

            // Create a copy and remove sensitive fields
            const copy = { ...(user as Record<string, unknown>) } as Record<string, unknown>;
            delete copy.password;

            const base = copy as Omit<User, "password">;

            const resp: AdminUserResponse = {
              ...base,
              violationCount,
              totalFines,
              outstandingFines,
              hasViolations: hasV,
              hasOutstandingFines: hasOutstanding,
            };

            return resp;
          })
        );

        const validAll = enrichedAll.filter((u) => {
          if (!u) return false;
          if (filters.hasViolations !== undefined && filters.hasViolations !== u.hasViolations) return false;
          if (filters.hasOutstandingFines !== undefined && filters.hasOutstandingFines !== u.hasOutstandingFines) return false;
          return true;
        }) as AdminUserResponse[];

        const total = validAll.length;
        const start = (page - 1) * limit;
        const pageUsers = validAll.slice(start, start + limit);

        return NextResponse.json({
          success: true,
          data: {
            users: pageUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            filters,
          },
        });
      }

      // Default (no derived filters) - perform paginated query and return counts
      const total = await usersCollection.countDocuments(query);

      const users = await usersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const enriched = await Promise.all(
        users.map(async (user) => {
          const cases = await casesCollection.find({ userId: user.id }).toArray();

          const violationCount = cases.length;
          const totalFines = cases.reduce((sum, c) => sum + (c.fine ?? 0), 0);
          const outstandingFines = cases.filter((c) => c.status !== "paid").reduce((sum, c) => sum + (c.fine ?? 0), 0);

          // Create a copy and remove sensitive fields
          const copy = { ...(user as Record<string, unknown>) } as Record<string, unknown>;
          delete copy.password;

          const base = copy as Omit<User, "password">;

          const resp: AdminUserResponse = {
            ...base,
            violationCount,
            totalFines,
            outstandingFines,
            hasViolations: violationCount > 0,
            hasOutstandingFines: outstandingFines > 0,
          };

          return resp;
        })
      );

      const validUsers = enriched.filter((u): u is AdminUserResponse => u !== null);

      return NextResponse.json({
        success: true,
        data: {
          users: validUsers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          filters,
        },
      });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateUserRequest;

    if (!body?.name || !body?.email || !body?.password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 });
    }

    const usersCollection = await getCollection<User>("users");

    const existingUser = await usersCollection.findOne({
      $or: [{ email: body.email.toLowerCase() }, { numberPlate: body.numberPlate?.toUpperCase() }],
    });

    if (existingUser) return NextResponse.json({ success: false, error: "User with this email or number plate already exists" }, { status: 409 });

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: body.name,
      email: body.email.toLowerCase(),
      password: body.password, // TODO: hash before storing in production
      numberPlate: body.numberPlate?.toUpperCase(),
      role: body.role ?? "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    } as User;

  await usersCollection.insertOne(newUser);

  const userWithoutPassword = { ...newUser } as Record<string, unknown>;
  delete userWithoutPassword.password;

  return NextResponse.json({ success: true, data: userWithoutPassword, message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}

// PUT /api/admin/users - Update multiple users (bulk operations)
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkUpdateRequest;

    if (!body?.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
      return NextResponse.json({ success: false, error: "User IDs array is required" }, { status: 400 });
    }

    const usersCollection = await getCollection<User>("users");

    const updates: AdminUserUpdate = { updatedAt: new Date().toISOString() };

    if (body.action === "suspend") {
      updates.status = "suspended";
      updates.suspendedAt = new Date().toISOString();
      updates.suspendedReason = body.reason ?? "Suspended by admin";
      updates.suspendedBy = body.adminId ?? "system";
    } else if (body.action === "activate") {
      updates.status = "active";
      updates.suspendedAt = null;
      updates.suspendedReason = null;
      updates.suspendedBy = null;
    } else if (body.action === "deactivate") {
      updates.status = "inactive";
      updates.isActive = false;
    } else if (body.action === "verifyEmail") {
      updates.emailVerified = true;
    } else if (body.action === "verifyPhone") {
      updates.phoneVerified = true;
    } else if (body.action === "updateRole" && body.role) {
      updates.role = body.role;
    } else if (body.updates) {
      Object.assign(updates, body.updates as Partial<User>);
    }

    const result: UpdateResult = await usersCollection.updateMany({ id: { $in: body.userIds } }, { $set: updates });

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      message: `Successfully updated ${result.modifiedCount} users`,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json({ success: false, error: "Failed to update users" }, { status: 500 });
  }
}
