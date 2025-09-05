"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  MessageSquare,
  Plus,
  FileText,
  Shield,
  Eye,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";
import { validateAdminSession } from "@/lib/admin-utils";

interface DashboardStats {
  totalUsers: number;
  totalViolations: number;
  pendingViolations: number;
  openQueries: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalViolations: 0,
    pendingViolations: 0,
    openQueries: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminAuth = await validateAdminSession();
        if (adminAuth) {
          setAdmin(adminAuth.admin);
          // Fetch dashboard stats
          await fetchDashboardStats();
        } else {
          window.location.href = "/admin/login";
        }
      } catch (error) {
        console.error("Error validating admin auth:", error);
        window.location.href = "/admin/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user stats
      const userStatsResponse = await fetch("/api/admin/users/stats");
      if (userStatsResponse.ok) {
        const userStats = await userStatsResponse.json();
        setStats(prev => ({
          ...prev,
          totalUsers: userStats.data.overview.totalUsers,
        }));
      }

      // Fetch violation stats (you'll need to create this endpoint)
      // const violationStatsResponse = await fetch("/api/admin/violations/stats");
      // if (violationStatsResponse.ok) {
      //   const violationStats = await violationStatsResponse.json();
      //   setStats(prev => ({
      //     ...prev,
      //     totalViolations: violationStats.data.totalViolations,
      //     pendingViolations: violationStats.data.pendingViolations,
      //   }));
      // }

      // Fetch query stats (you'll need to create this endpoint)
      // const queryStatsResponse = await fetch("/api/admin/queries/stats");
      // if (queryStatsResponse.ok) {
      //   const queryStats = await queryStatsResponse.json();
      //   setStats(prev => ({
      //     ...prev,
      //     openQueries: queryStats.data.openQueries,
      //   }));
      // }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/admin/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    href,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    href?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-600 to-blue-700",
      green: "from-green-600 to-green-700",
      purple: "from-purple-600 to-purple-700",
      orange: "from-orange-600 to-orange-700",
    };

    const cardContent = (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {value.toLocaleString()}
              </p>
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-br ${
                colorClasses[color as keyof typeof colorClasses]
              } rounded-xl flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );

    if (href) {
      return (
        <Button
          variant="ghost"
          className="p-0 h-auto w-full"
          onClick={() => router.push(href)}
        >
          {cardContent}
        </Button>
      );
    }

    return cardContent;
  };

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {admin.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, violations, and support queries from your admin panel.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
              {admin.role.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {admin.department.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
            href="/admin/users"
          />
          <StatCard
            title="Total Violations"
            value={stats.totalViolations}
            icon={AlertTriangle}
            color="purple"
            href="/admin/violations"
          />
          <StatCard
            title="Pending Violations"
            value={stats.pendingViolations}
            icon={FileText}
            color="orange"
            href="/admin/violations"
          />
          <StatCard
            title="Open Queries"
            value={stats.openQueries}
            icon={MessageSquare}
            color="green"
            href="/admin/queries"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/admin/users")}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Users
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/users")}
              >
                <FileText className="w-4 h-4 mr-2" />
                User Details & Violation History
              </Button>
            </CardContent>
          </Card>

          {/* Violation Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Violation Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/admin/violations")}
              >
                <FileText className="w-4 h-4 mr-2" />
                View All Violations
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/violations/add")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Violation Case
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/violations/monitoring")}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Traffic Monitoring
              </Button>
            </CardContent>
          </Card>

          {/* Queries & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Queries & Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/admin/queries")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View All Queries
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/queries/open")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Queries
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push("/admin/violations/add")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Violation Case
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/admin/queries")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Handle Support Queries
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
