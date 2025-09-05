"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/dashboard/layout";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Eye,
  DollarSign,
  Calendar,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";

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
  riderName?: string | null;
  numberPlate?: string | null;
}

export default function ViolationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        setFilteredViolations(result.data);
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
      setIsLoadingViolations(false);
    }
  };

  useEffect(() => {
    let filtered = violations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (violation) =>
          violation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          violation.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          violation.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((violation) => violation.status === statusFilter);
    }

    setFilteredViolations(filtered);
  }, [violations, searchTerm, statusFilter]);

  const handleLogout = () => {
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

  const handlePayFine = (violationId: string) => {
    router.push(`/dashboard/payment/${violationId}`);
  };

  const handleContactAdmin = (violationId: string) => {
    router.push(`/dashboard/queries?case=${violationId}`);
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

  const isVideo = (url?: string | null) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
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

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Violation Cases</h1>
            <p className="text-muted-foreground mt-1">
              View all traffic violation cases filed against you.
            </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
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
            </div>
          </CardContent>
        </Card>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Cases</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredViolations.length} of {violations.length} cases
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingViolations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading violations...</span>
              </div>
            ) : filteredViolations.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No cases found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Number Plate</TableHead>
                    <TableHead>Uploaded Proof</TableHead>
                    <TableHead>Rider Name</TableHead>
                    <TableHead>Violation Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Fine Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium">{violation.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{violation.numberPlate || "-"}</div>
                      </TableCell>
                      <TableCell>
                        {violation.proofUrl ? (
                          isVideo(violation.proofUrl) ? (
                            <video
                              src={violation.proofUrl}
                              className="mx-auto rounded max-h-24 max-w-[160px]"
                              controls
                            />
                          ) : (
                            <div className="mx-auto rounded max-h-24 max-w-[160px] overflow-hidden">
                              <Image
                                src={violation.proofUrl}
                                alt={`Proof for case ${violation.id}`}
                                width={160}
                                height={96}
                                className="object-cover"
                              />
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{violation.riderName || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getViolationTypeLabel(violation.violationType)}</div>
                          <div className="text-sm text-muted-foreground">{violation.violation}</div>
                        </div>
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
                        {formatCurrency(violation.fine || 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(violation.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedViolation(violation)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Case Details - {violation.id}</DialogTitle>
                              </DialogHeader>
                              {selectedViolation && (
                                <div className="space-y-6">
                                  {/* Case Information */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Case Number</h4>
                                      <p className="font-medium">{selectedViolation.id}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                                      {getStatusBadge(selectedViolation.status)}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Number Plate</h4>
                                      <p className="font-medium">{selectedViolation.numberPlate || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Rider Name</h4>
                                      <p className="font-medium">{selectedViolation.riderName || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Violation Type</h4>
                                      <p className="font-medium">{getViolationTypeLabel(selectedViolation.violationType)}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Fine Amount</h4>
                                      <p className="font-medium">{formatCurrency(selectedViolation.fine || 0)}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                                      <p className="text-sm">{selectedViolation.location}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
                                      <p className="text-sm">{formatDate(selectedViolation.date)}</p>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Description</h4>
                                    <p className="text-sm bg-muted p-3 rounded-md">{selectedViolation.violation}</p>
                                  </div>

                                  {/* Proof Image */}
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Uploaded Proof</h4>
                                    <div className="bg-muted p-4 rounded-md text-center">
                                      {selectedViolation.proofUrl ? (
                                        isVideo(selectedViolation.proofUrl) ? (
                                          <video
                                            src={selectedViolation.proofUrl}
                                            controls
                                            className="mx-auto mb-2 max-h-80 w-full rounded"
                                          />
                                          ) : (
                                            <div className="mx-auto mb-2 max-h-80 w-full relative">
                                              <Image
                                                src={selectedViolation.proofUrl}
                                                alt={`Proof for case ${selectedViolation.id}`}
                                                width={800}
                                                height={450}
                                                className="object-contain rounded"
                                              />
                                            </div>
                                          )
                                        ) : (
                                          <div className="mx-auto mb-2 max-h-48 relative w-full h-48">
                                            <Image src="/uploads/images/placeholder-violation-1.jpg" alt="placeholder" width={400} height={200} className="object-contain" />
                                          </div>
                                        )}
                                      <p className="text-sm text-muted-foreground">
                                        Uploaded proof (image or video). Click to play or open in a new tab.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex justify-end space-x-2">
                                    {(selectedViolation.status === "pending" || selectedViolation.status === "disputed") && (
                                      <Button
                                        onClick={() => handlePayFine(selectedViolation.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Pay Fine
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      onClick={() => handleContactAdmin(selectedViolation.id)}
                                    >
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Contact Admin
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {(violation.status === "pending" || violation.status === "disputed") && (
                            <Button
                              size="sm"
                              onClick={() => handlePayFine(violation.id)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
