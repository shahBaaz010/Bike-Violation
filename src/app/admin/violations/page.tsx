"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  Video,
  Plus,
  Loader2,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";
import { validateAdminSession } from "@/lib/admin-utils";

interface Violation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  numberPlate: string;
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

export default function ViolationsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
  // read violations length to satisfy certain linters which may flag unused state
  const _violationsCount = violations.length;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const loadViolations = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("violationType", typeFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/violations?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setViolations(result.data.data);
        setFilteredViolations(result.data.data);
      } else {
        console.error("Failed to load violations:", result.error);
        setViolations([]);
        setFilteredViolations([]);
      }
    } catch (error) {
      console.error("Error loading violations:", error);
      setViolations([]);
      setFilteredViolations([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminAuth = await validateAdminSession();
        if (adminAuth) {
          setAdmin(adminAuth.admin);
          loadViolations();
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
  }, [loadViolations]);

  useEffect(() => {
    if (admin) {
      loadViolations();
    }
  }, [admin, statusFilter, typeFilter, searchTerm, loadViolations]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/admin/login";
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

  const getProofIcon = (proofUrl: string) => {
    const isVideo = proofUrl.match(/\.(mp4|avi|mov|wmv|flv)$/i);
    return isVideo ? Video : Camera;
  };

  const getViolationTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      no_helmet: "No Helmet",
      traffic_light: "Red Light Violation",
      parking: "Illegal Parking",
      speeding: "Speeding",
      wrong_lane: "Wrong Lane",
      mobile_use: "Mobile Use",
      other: "Other",
    };
    return typeLabels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Violation Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all violation cases. Monitor traffic and add new violations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadViolations} disabled={isLoadingData}>
              {isLoadingData ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button onClick={() => router.push("/admin/violations/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Case
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search violations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Violation Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="no_helmet">No Helmet</SelectItem>
                    <SelectItem value="traffic_light">Red Light Violation</SelectItem>
                    <SelectItem value="parking">Illegal Parking</SelectItem>
                    <SelectItem value="speeding">Speeding</SelectItem>
                    <SelectItem value="wrong_lane">Wrong Lane</SelectItem>
                    <SelectItem value="mobile_use">Mobile Use</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Violations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredViolations.length} of {_violationsCount} violations
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading violations...</span>
              </div>
            ) : filteredViolations.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No violations found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new violation case.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Number Plate</TableHead>
                    <TableHead>Violation Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredViolations.map((violation) => {
                    const ProofIcon = getProofIcon(violation.proofUrl);
                    return (
                      <TableRow key={violation.id}>
                        <TableCell className="font-medium">{violation.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{violation.userName}</div>
                            <div className="text-sm text-muted-foreground">{violation.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{violation.numberPlate}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getViolationTypeLabel(violation.violationType)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">{violation.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">{formatDate(violation.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(violation.fine)}
                        </TableCell>
                        <TableCell>{getStatusBadge(violation.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(violation.proofUrl, '_blank')}
                          >
                            <ProofIcon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/violations/${violation.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
