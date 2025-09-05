import { getCollection } from "@/lib/database/mongodb";
import { AdminUser, AdminSession, AdminActivity } from "@/types/violation";
import type { OptionalId } from "mongodb";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function getAdminUsersCollection() {
  return getCollection<AdminUser>("admin_users");
}

async function getAdminSessionsCollection() {
  return getCollection<AdminSession>("admin_sessions");
}

async function getAdminActivitiesCollection() {
  return getCollection<AdminActivity>("admin_activities");
}

export const adminService = {
  async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    try {
      const adminUsers = await getAdminUsersCollection();
      
      // Find admin by email
      const admin = await adminUsers.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      }) as AdminUser | null;

      if (!admin) {
        return null;
      }

      // In a real application, you would hash the password and compare hashes
      // For now, we'll assume the password is stored as-is (not recommended for production)
      if (admin.password !== password) {
        return null;
      }

      // Update last login
      await adminUsers.updateOne(
        { id: admin.id },
        { $set: { lastLogin: nowIso(), updatedAt: nowIso() } }
      );

      return admin;
    } catch (error) {
      console.error("Admin authentication error:", error);
      return null;
    }
  },

  async getAdminById(id: string): Promise<AdminUser | null> {
    try {
      const adminUsers = await getAdminUsersCollection();
      return await adminUsers.findOne({ id }) as AdminUser | null;
    } catch (error) {
      console.error("Get admin by ID error:", error);
      return null;
    }
  },

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const adminUsers = await getAdminUsersCollection();
      return await adminUsers.findOne({ email: email.toLowerCase() }) as AdminUser | null;
    } catch (error) {
      console.error("Get admin by email error:", error);
      return null;
    }
  },

  async createAdminSession(adminId: string, token: string, ipAddress?: string, userAgent?: string): Promise<AdminSession> {
    try {
      const sessions = await getAdminSessionsCollection();
      
      const session: AdminSession = {
        id: generateId("session"),
        adminId,
        token,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        createdAt: nowIso(),
        ipAddress,
        userAgent,
      };

  await sessions.insertOne(session as OptionalId<AdminSession>);
  return session;
    } catch (error) {
      console.error("Create admin session error:", error);
      throw error;
    }
  },

  async validateSession(token: string): Promise<AdminSession | null> {
    try {
      const sessions = await getAdminSessionsCollection();
      const session = await sessions.findOne({ 
        token,
        expiresAt: { $gt: nowIso() }
      }) as AdminSession | null;

      return session;
    } catch (error) {
      console.error("Validate session error:", error);
      return null;
    }
  },

  async invalidateSession(token: string): Promise<boolean> {
    try {
      const sessions = await getAdminSessionsCollection();
      const result = await sessions.deleteOne({ token });
      return result.deletedCount === 1;
    } catch (error) {
      console.error("Invalidate session error:", error);
      return false;
    }
  },

  async logAdminActivity(activity: Omit<AdminActivity, 'id' | 'createdAt'>): Promise<AdminActivity> {
    try {
      const activities = await getAdminActivitiesCollection();
      
      const newActivity: AdminActivity = {
        id: generateId("activity"),
        ...activity,
        createdAt: nowIso(),
      };

  await activities.insertOne(newActivity as OptionalId<AdminActivity>);
  return newActivity;
    } catch (error) {
      console.error("Log admin activity error:", error);
      throw error;
    }
  },

  async getAdminActivities(adminId?: string, limit = 100): Promise<AdminActivity[]> {
    try {
      const activities = await getAdminActivitiesCollection();
      const query = adminId ? { adminId } : {};
      
      return await activities
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray() as AdminActivity[];
    } catch (error) {
      console.error("Get admin activities error:", error);
      return [];
    }
  },

  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const adminUsers = await getAdminUsersCollection();
      return await adminUsers
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray() as AdminUser[];
    } catch (error) {
      console.error("Get all admins error:", error);
      return [];
    }
  },

  async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const adminUsers = await getAdminUsersCollection();
      const updateResult = await adminUsers.updateOne(
        { id },
        { $set: { ...updates, updatedAt: nowIso() } }
      );

      if (updateResult.matchedCount === 0) return null;
      return (await adminUsers.findOne({ id })) as AdminUser | null;
    } catch (error) {
      console.error("Update admin error:", error);
      return null;
    }
  },

  async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    try {
      const adminUsers = await getAdminUsersCollection();
      
      // Check if admin with this email already exists
      const existing = await adminUsers.findOne({ email: adminData.email.toLowerCase() });
      if (existing) {
        throw new Error("Admin with this email already exists");
      }

      const admin: AdminUser = {
        id: generateId("admin"),
        ...adminData,
        email: adminData.email.toLowerCase(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

  await adminUsers.insertOne(admin as OptionalId<AdminUser>);
  return admin;
    } catch (error) {
      console.error("Create admin error:", error);
      throw error;
    }
  },
};

export default adminService;
