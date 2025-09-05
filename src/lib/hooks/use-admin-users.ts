"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  numberPlate?: string;
  role: "user" | "admin" | "super_admin";
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  registeredAt: string;
  lastLoginAt?: string;
  violationCount: number;
  totalFines: number;
  outstandingFines: number;
  avatar?: string;
  notes?: string;
  status: "active" | "suspended" | "inactive";
  suspendedAt?: string;
  suspendedReason?: string;
  suspendedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasViolations?: boolean;
  hasOutstandingFines?: boolean;
  registeredAfter?: string;
  registeredBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    inactiveUsers: number;
    activePercentage: string;
    suspendedPercentage: string;
    inactivePercentage: string;
  };
  verification: {
    emailVerifiedUsers: number;
    phoneVerifiedUsers: number;
    emailVerifiedPercentage: string;
    phoneVerifiedPercentage: string;
  };
  roles: {
    regularUsers: number;
    adminUsers: number;
    superAdminUsers: number;
  };
  violations: {
    usersWithViolations: number;
    usersWithoutViolations: number;
    usersWithOutstandingFines: number;
    usersWithViolationsPercentage: string;
    usersWithOutstandingFinesPercentage: string;
  };
  registration: {
    recentRegistrations: number;
    lastWeekRegistrations: number;
    todayRegistrations: number;
    monthlyRegistrations: Array<{ month: string; count: number }>;
  };
  numberPlates: {
    usersWithNumberPlates: number;
    usersWithoutNumberPlates: number;
  };
  topViolators: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    violationCount: number;
    totalFines: number;
  }>;
}

// Hook for fetching users with filtering and pagination
export function useAdminUsers(filters: UserFilters = {}, page: number = 1, limit: number = 10) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

  const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== "");
      // Convert values to strings because URLSearchParams requires string pairs
      const serialized = entries.map(([k, v]) => [k, String(v)]) as [string, string][];

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(serialized)
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.data.users);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchUsers
  };
}

// Hook for user statistics
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/users/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user statistics");
      }

      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch user statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Hook for individual user operations
export function useUserOperations() {
  const [loading, setLoading] = useState(false);

  const createUser = async (userData: Partial<AdminUser> & { password: string }) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully");
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser> | Record<string, unknown>) : Promise<unknown> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      return data.data as unknown;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason?: string) => {
    return updateUser(userId, {
      action: "suspend",
      reason
    });
  };

  const activateUser = async (userId: string) => {
    return updateUser(userId, { action: "activate" });
  };

  const deactivateUser = async (userId: string) => {
    return updateUser(userId, { action: "deactivate" });
  };

  const verifyEmail = async (userId: string) => {
    return updateUser(userId, { action: "verifyEmail" });
  };

  const verifyPhone = async (userId: string) => {
    return updateUser(userId, { action: "verifyPhone" });
  };

  const updateRole = async (userId: string, role: AdminUser["role"]) => {
    return updateUser(userId, { action: "updateRole", role });
  };

  const bulkUpdate = async (userIds: string[], action: string, data?: Record<string, unknown>) : Promise<unknown> => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds, action, ...data })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update users");
      }

      toast.success(`Successfully updated ${result.data.modifiedCount} users`);
      return result.data as unknown;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update users";
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    deactivateUser,
    verifyEmail,
    verifyPhone,
    updateRole,
    bulkUpdate
  };
}

// Hook for fetching individual user details
export function useUserDetails(userId: string) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user details");
      }

      setUser(data.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return {
    user,
    loading,
    error,
    refetch: fetchUserDetails
  };
}
