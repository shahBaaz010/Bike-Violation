"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Reply,
  Loader2,
  Eye,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";
import { validateAdminSession } from "@/lib/admin-utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Query {
  id: string;
  userId: string;
  caseId?: string;
  subject: string;
  message: string;
  category: "violation_dispute" | "payment_issues" | "technical_support" | "general_inquiry";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  date: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  responses: QueryResponse[];
  attachments?: QueryAttachment[];
  tags?: string[];
  isUrgent: boolean;
  lastResponseAt?: string;
  // Enriched user data
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface QueryResponse {
  id: string;
  queryId: string;
  message: string;
  respondedBy: string;
  respondedAt: string;
  isFromAdmin: boolean;
  template?: string;
  priority?: "low" | "medium" | "high";
  attachments?: QueryAttachment[];
  internalNotes?: string;
  editedAt?: string;
  isEdited: boolean;
}

interface QueryAttachment {
  id: string;
  queryId?: string;
  responseId?: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  isPublic: boolean;
}

export default function AdminQueriesPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queries, setQueries] = useState<Query[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminAuth = await validateAdminSession();
        if (adminAuth) {
          setAdmin(adminAuth.admin);
          loadQueries();
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

  const loadQueries = async () => {
    setIsLoadingQueries(true);
    try {
      const response = await fetch("/api/queries");
      const result = await response.json();

      if (result.success) {
        // Enrich queries with user data
        const enrichedQueries = await Promise.all(
          result.data.data.map(async (query: Query) => {
            try {
              const userResponse = await fetch(`/api/admin/users/${query.userId}`);
              const userResult = await userResponse.json();
              
              if (userResult.success) {
                return {
                  ...query,
                  userName: userResult.data.name,
                  userEmail: userResult.data.email,
                  userPhone: userResult.data.phoneNumber,
                };
              }
              return query;
            } catch (error) {
              console.error("Error fetching user data:", error);
              return query;
            }
          })
        );

        setQueries(enrichedQueries);
        setFilteredQueries(enrichedQueries);
      } else {
        console.error("Failed to load queries:", result.error);
        setQueries([]);
        setFilteredQueries([]);
      }
    } catch (error) {
      console.error("Error loading queries:", error);
      setQueries([]);
      setFilteredQueries([]);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  useEffect(() => {
    let filtered = queries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (query) =>
          query.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (query.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((query) => query.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((query) => query.category === categoryFilter);
    }

    setFilteredQueries(filtered);
  }, [queries, searchTerm, statusFilter, categoryFilter]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    router.push("/admin/login");
  };

  const handleRespond = async () => {
    if (!selectedQuery || !responseMessage.trim() || !admin) return;

    setIsResponding(true);
    try {
      const responseData = {
        queryId: selectedQuery.id,
        message: responseMessage,
        isFromAdmin: true,
        priority: selectedQuery.priority,
      };

      const response = await fetch("/api/queries/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responseData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Response sent successfully!");
        setResponseMessage("");
        setSelectedQuery(null);
        // Reload queries to show updated status
        await loadQueries();
      } else {
        toast.error(result.error || "Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };

  // const handleStatusChange = async (queryId: string, newStatus: string) => {
  //   try {
  //     const response = await fetch(`/api/queries/${queryId}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       toast.success("Status updated successfully!");
  //       await loadQueries();
  //     } else {
  //       toast.error(result.error || "Failed to update status");
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     toast.error("Failed to update status. Please try again.");
  //   }
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
            <MessageSquare className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "violation_dispute":
        return "Violation Dispute";
      case "payment_issues":
        return "Payment Issues";
      case "technical_support":
        return "Technical Support";
      case "general_inquiry":
        return "General Inquiry";
      default:
        return category;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <h1 className="text-3xl font-bold text-foreground">Query Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and respond to user queries and support requests.
            </p>
          </div>
          <Button onClick={loadQueries} disabled={isLoadingQueries}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingQueries ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="violation_dispute">Violation Dispute</SelectItem>
              <SelectItem value="payment_issues">Payment Issues</SelectItem>
              <SelectItem value="technical_support">Technical Support</SelectItem>
              <SelectItem value="general_inquiry">General Inquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>All Queries ({filteredQueries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingQueries ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading queries...</span>
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No queries found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters."
                    : "No queries have been submitted yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">{query.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{query.userName || "Unknown User"}</div>
                          <div className="text-sm text-muted-foreground">{query.userEmail || "No email"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{query.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {query.message.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(query.category)}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                      <TableCell>{getStatusBadge(query.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{formatDate(query.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedQuery(query)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Query Details - {query.id}</DialogTitle>
                              </DialogHeader>
                              {selectedQuery && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">User</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedQuery.userName || "Unknown User"}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedQuery.userEmail || "No email"}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Status</Label>
                                      <div className="mt-1">{getStatusBadge(selectedQuery.status)}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Subject</Label>
                                    <p className="text-sm">{selectedQuery.subject}</p>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Message</Label>
                                    <p className="text-sm whitespace-pre-wrap">{selectedQuery.message}</p>
                                  </div>

                                  {selectedQuery.responses.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium">Responses</Label>
                                      <div className="space-y-2 mt-2">
                                        {selectedQuery.responses.map((response) => (
                                          <div key={response.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-sm font-medium">
                                                {response.isFromAdmin ? "Admin" : "User"}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDate(response.respondedAt)}
                                              </span>
                                            </div>
                                            <p className="text-sm">{response.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Add Response</Label>
                                      <Textarea
                                        placeholder="Type your response..."
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        rows={4}
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        onClick={handleRespond}
                                        disabled={!responseMessage.trim() || isResponding}
                                      >
                                        {isResponding ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            <Reply className="w-4 h-4 mr-2" />
                                            Send Response
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </AdminLayout>
  );
}
