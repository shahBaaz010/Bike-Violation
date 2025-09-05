"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  MessageSquare,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

// local User type removed to use auth-provided shape
interface Violation {
  id: string;
  userId: string;
  violationType: string;
  violation: string;
  location: string;
  date: string;
  fine: number;
  status: "pending" | "paid" | "disputed" | "resolved" | "cancelled";
  proofUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        loadUserViolations(user.id);
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadUserViolations = async (userId: string) => {
    setIsLoadingViolations(true);
    try {
      const response = await fetch(`/api/users/violations?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setViolations(result.data);
      } else {
        console.error("Failed to load violations:", result.error);
        setViolations([]);
      }
    } catch (error) {
      console.error("Error loading violations:", error);
      setViolations([]);
    } finally {
      setIsLoadingViolations(false);
    }
  };

  const handleLogout = () => {
    // Clear auth via context if available, otherwise fallback
    try {
      if (typeof logout === "function") logout();
    } catch {
      localStorage.removeItem("auth");
    }
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "disputed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingViolations = violations.filter(v => v.status === "pending" || v.status === "disputed");
  const totalFines = violations
    .filter(v => v.status === "pending" || v.status === "disputed")
    .reduce((sum, v) => sum + (v.fine || 0), 0);

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.firstName || user.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              View your traffic violation cases and manage your account.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {pendingViolations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Fines</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {formatCurrency(totalFines)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {violations.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Violations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Recent Violation Cases</span>
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/violations")}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Cases
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingViolations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading violations...</span>
              </div>
            ) : pendingViolations.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No active cases</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have no pending violation cases at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingViolations.slice(0, 3).map((violation) => (
                  <div
                    key={violation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{violation.id}</p>
                          <p className="text-sm text-muted-foreground">{violation.violationType}</p>
                        </div>
                        {getStatusBadge(violation.status)}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {violation.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(violation.date)}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(violation.fine || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/violations/${violation.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(violation.status === "pending" || violation.status === "disputed") && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/dashboard/payment/${violation.id}`)}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/dashboard/payments")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pay Outstanding Fines
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/payment-history")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Payment History
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/dashboard/queries")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Query to Admin
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/queries")}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Query History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
