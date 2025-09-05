"use client";

import { ReactNode } from "react";
import { AdminNavbar } from "./admin-navbar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: ReactNode;
  admin: AdminUser;
  onLogout: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function AdminLayout({
  children,
  admin,
  onLogout,
  breadcrumbs,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <AdminNavbar admin={admin} onLogout={onLogout} />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar admin={admin} />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="mb-6">
                <AdminBreadcrumbs items={breadcrumbs} />
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
