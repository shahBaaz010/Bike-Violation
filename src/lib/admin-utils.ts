import { AdminUser, AdminPermission } from "@/types/violation";

export interface AdminAuth {
  isAuthenticated: boolean;
  admin: AdminUser;
  token: string;
  expiresAt: string;
}

export async function validateAdminSession(): Promise<AdminAuth | null> {
  try {
    const adminAuthStr = localStorage.getItem("adminAuth");
    if (!adminAuthStr) {
      return null;
    }

    const adminAuth: AdminAuth = JSON.parse(adminAuthStr);

    // Check if session is expired
    if (new Date(adminAuth.expiresAt) < new Date()) {
      localStorage.removeItem("adminAuth");
      return null;
    }

    // Validate session with server
    const response = await fetch("/api/admin/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: adminAuth.token,
      }),
    });

    if (!response.ok) {
      localStorage.removeItem("adminAuth");
      return null;
    }

    const data = await response.json();
    
    // Update admin data with latest from server
    const updatedAdminAuth: AdminAuth = {
      ...adminAuth,
      admin: data.admin,
    };

    localStorage.setItem("adminAuth", JSON.stringify(updatedAdminAuth));
    return updatedAdminAuth;
  } catch (error) {
    console.error("Admin session validation error:", error);
    localStorage.removeItem("adminAuth");
    return null;
  }
}

export async function logoutAdmin(): Promise<boolean> {
  try {
    const adminAuthStr = localStorage.getItem("adminAuth");
    if (!adminAuthStr) {
      return true;
    }

    const adminAuth: AdminAuth = JSON.parse(adminAuthStr);

    // Invalidate session on server
    const response = await fetch(`/api/admin/auth?token=${adminAuth.token}`, {
      method: "DELETE",
    });

    // Remove from localStorage regardless of server response
    localStorage.removeItem("adminAuth");
    
    return response.ok;
  } catch (error) {
    console.error("Admin logout error:", error);
    localStorage.removeItem("adminAuth");
    return true;
  }
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const adminAuthStr = localStorage.getItem("adminAuth");
    if (!adminAuthStr) {
      return null;
    }

    const adminAuth: AdminAuth = JSON.parse(adminAuthStr);

    // Check if session is expired
    if (new Date(adminAuth.expiresAt) < new Date()) {
      localStorage.removeItem("adminAuth");
      return null;
    }

    return adminAuth.admin;
  } catch (error) {
    console.error("Get current admin error:", error);
    localStorage.removeItem("adminAuth");
    return null;
  }
}

export function hasAdminPermission(
  admin: AdminUser,
  resource: AdminPermission["resource"],
  action: AdminPermission["actions"][number]
): boolean {
  const permission = admin.permissions.find((p) => p.resource === resource);
  if (!permission) return false;
  return permission.actions.includes(action);
}

export function isAdminAuthenticated(): boolean {
  return getCurrentAdmin() !== null;
}
