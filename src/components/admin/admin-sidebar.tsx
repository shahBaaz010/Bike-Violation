"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  MessageSquare,
  Plus,
  FileText,
  Shield,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
}

interface AdminSidebarProps {
  admin: AdminUser;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["violations"]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      children: [
        {
          name: "All Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          name: "User Details",
          href: "/admin/users/details",
          icon: FileText,
        },
      ],
    },
    {
      name: "Violation Management",
      href: "/admin/violations",
      icon: AlertTriangle,
      children: [
        {
          name: "All Violations",
          href: "/admin/violations",
          icon: FileText,
        },
        {
          name: "Add New Case",
          href: "/admin/violations/add",
          icon: Plus,
        },
        {
          name: "Traffic Monitoring",
          href: "/admin/violations/monitoring",
          icon: AlertTriangle,
        },
      ],
    },
    {
      name: "Queries & Support",
      href: "/admin/queries",
      icon: MessageSquare,
      children: [
        {
          name: "All Queries",
          href: "/admin/queries",
          icon: MessageSquare,
        },
        {
          name: "Open Queries",
          href: "/admin/queries/open",
          icon: MessageSquare,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemIsActive = isActive(item.href);

    return (
      <div key={item.name}>
        <div className={`group relative ${level > 0 ? "ml-4" : ""}`}>
          {level === 0 && (
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-600 rounded-r-full transition-opacity ${
                itemIsActive ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          <div className="flex items-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                onClick={() => toggleExpanded(item.name)}
                className={`flex-1 justify-start px-3 py-2 h-auto transition-all ${
                  itemIsActive
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 text-purple-700 dark:text-purple-300 border-r-2 border-purple-500"
                    : "hover:bg-accent"
                } ${level > 0 ? "text-sm" : ""}`}
              >
                <Icon
                  className={`${
                    level > 0 ? "w-4 h-4" : "w-5 h-5"
                  } mr-3 flex-shrink-0`}
                />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                asChild
                className={`w-full justify-start px-3 py-2 h-auto transition-all ${
                  itemIsActive
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 text-purple-700 dark:text-purple-300 border-r-2 border-purple-500"
                    : "hover:bg-accent"
                } ${level > 0 ? "text-sm" : ""}`}
              >
                <Link href={item.href}>
                  <Icon
                    className={`${
                      level > 0 ? "w-4 h-4" : "w-5 h-5"
                    } mr-3 flex-shrink-0`}
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-background border-r border-border h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        {/* Admin Info */}
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {admin.role.replace("_", " ")} •{" "}
                {admin.department.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  );
}
