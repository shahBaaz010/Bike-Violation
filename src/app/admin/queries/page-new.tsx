"use client";

import { useEffect, useState, useMemo } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminReplyForm } from "@/components/admin/AdminReplyForm";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Eye,
  Paperclip,
  Download,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useQueries } from "@/lib/database/hooks";
import { Query, QueryFilters } from "@/lib/database/models";

interface QueryAttachment {
  id: string;
  filename: string;
  fileSize: number;
}

interface QueryResponse {
  id: string;
  message: string;
  respondedAt: string;
  isFromAdmin: boolean;
}

export default function AdminQueriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  // Adapt authenticated user shape to AdminLayout's expected admin prop
  const admin = useMemo(() => {
    if (!user || !user.id) return null;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.name || "",
      lastName: user.lastName || "",
      role: "admin" as const,
      department: "management" as const,
    };
  }, [user]);

  // Database state
  const [filters, setFilters] = useState<QueryFilters>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { queries, loading, error, refresh } = useQueries(
    filters,
    page,
    limit
  );

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push("/admin/login");
    }
  }, [admin, authLoading, router]);

  // Update filters when filter controls change
  useEffect(() => {
    const newFilters: QueryFilters = {};

    if (statusFilter !== "all") {
      newFilters.status = statusFilter as QueryFilters["status"];
    }

    if (categoryFilter !== "all") {
      newFilters.category = categoryFilter as QueryFilters["category"];
    }

    if (priorityFilter !== "all") {
      newFilters.priority = priorityFilter as QueryFilters["priority"];
    }

    setFilters(newFilters);
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleSendReply = async (replyData: {
    queryId: string;
    message: string;
    template?: string;
    attachments?: File[];
    priority?: "low" | "medium" | "high";
    emailNotification?: boolean;
    markAsResolved?: boolean;
    internalNotes?: string;
  }) => {
    try {
      // 1) Create the response record
      const res = await fetch(`/api/queries/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId: replyData.queryId,
          message: replyData.message,
          isFromAdmin: true,
          template: replyData.template,
          priority: replyData.priority,
          internalNotes: replyData.internalNotes,
          markAsResolved: replyData.markAsResolved,
        }),
      });
      const created = await res.json();
      if (!created.success) throw new Error(created.error || "Failed to create response");
      const responseId = created.data.id;

      // 2) Upload attachments (if any) and link them to the response
      if (replyData.attachments && replyData.attachments.length > 0) {
        for (const file of replyData.attachments) {
          const form = new FormData();
          form.append("file", file as Blob);
          form.append("responseId", responseId);
          // POST to our admin attachment endpoint which returns saved attachment record
          const up = await fetch(`/api/admin/queries/attachments`, { method: "POST", body: form });
          const upRes = await up.json();
          if (!upRes.success) console.error("Attachment upload failed", upRes.error || upRes);
        }
      }

      // 3) Optionally mark as resolved handled by createQueryResponse
      await refresh();
      setShowReplyForm(false);
      setSelectedQuery(null);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleAssignQuery = async (queryId: string) => {
    try {
      // In a real implementation, you'd call an API to assign the query
      console.log("Assigning query:", queryId, "to admin:", admin?.id);
      await refresh();
    } catch (error) {
      console.error("Error assigning query:", error);
    }
  };

  const handleResolveQuery = async (queryId: string) => {
    try {
      // In a real implementation, you'd call an API to resolve the query
      console.log("Resolving query:", queryId);
      await refresh();
    } catch (error) {
      console.error("Error resolving query:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <MessageSquare className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    // not authorized
    router.push("/admin/login");
    return null;
  }

  return (
    <AdminLayout admin={admin} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Query Management</h1>
            <p className="text-gray-500 mt-1">
              Manage and respond to user queries
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queries?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Open Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {queries?.data.filter((q) => q.status === "open").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {queries?.data.filter((q) => q.status === "in_progress")
                  .length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {queries?.data.filter((q) => q.priority === "high").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search queries..."
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="violation_dispute">
                      Violation Dispute
                    </SelectItem>
                    <SelectItem value="payment_issues">
                      Payment Issues
                    </SelectItem>
                    <SelectItem value="technical_support">
                      Technical Support
                    </SelectItem>
                    <SelectItem value="general_inquiry">
                      General Inquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading queries: {error}</p>
                <Button onClick={refresh} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queries?.data.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-mono text-sm">
                        {query.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {query.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(query.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                      <TableCell>{getStatusBadge(query.status)}</TableCell>
                      <TableCell>{formatDateTime(query.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedQuery(query)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Query Details - {query.id}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedQuery && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">Subject</h4>
                                      <p>{selectedQuery.subject}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Category
                                      </h4>
                                      <Badge variant="outline">
                                        {getCategoryLabel(
                                          selectedQuery.category
                                        )}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Priority
                                      </h4>
                                      {getPriorityBadge(selectedQuery.priority)}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Status</h4>
                                      {getStatusBadge(selectedQuery.status)}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold">
                                      Description
                                    </h4>
                                    <p className="mt-2 p-3 bg-gray-50 rounded-md">
                                      {selectedQuery.message}
                                    </p>
                                  </div>

                                  {selectedQuery.attachments &&
                                    selectedQuery.attachments.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold">
                                          Attachments
                                        </h4>
                                        <div className="mt-2 space-y-2">
                                          {selectedQuery.attachments.map(
                                            (attachment: QueryAttachment) => (
                                              <div
                                                key={attachment.id}
                                                className="flex items-center space-x-2 p-2 border rounded"
                                              >
                                                <Paperclip className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">
                                                  {attachment.filename}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  (
                                                  {formatFileSize(
                                                    attachment.fileSize
                                                  )}
                                                  )
                                                </span>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                >
                                                  <Download className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {selectedQuery.responses &&
                                    selectedQuery.responses.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold">
                                          Conversation
                                        </h4>
                                        <div className="mt-2 space-y-3">
                                          {selectedQuery.responses.map(
                                            (response: QueryResponse) => (
                                              <div
                                                key={response.id}
                                                className={`p-3 rounded-md ${
                                                  response.isFromAdmin
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : "bg-gray-50 border-l-4 border-gray-300"
                                                }`}
                                              >
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="font-medium">
                                                    {response.isFromAdmin
                                                      ? "Admin"
                                                      : "User"}
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    {formatDateTime(
                                                      response.respondedAt
                                                    )}
                                                  </span>
                                                </div>
                                                <p className="text-sm">
                                                  {response.message}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      onClick={() => setShowReplyForm(true)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Send Professional Reply
                                    </Button>
                                    {selectedQuery.status === "open" && (
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          handleAssignQuery(selectedQuery.id)
                                        }
                                      >
                                        Assign to Me
                                      </Button>
                                    )}
                                    {selectedQuery.status !== "resolved" && (
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          handleResolveQuery(selectedQuery.id)
                                        }
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as Resolved
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedQuery(query);
                              setShowReplyForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Reply
                          </Button>

                          {query.status === "open" && (
                            <Button
                              size="sm"
                              onClick={() => handleAssignQuery(query.id)}
                            >
                              Assign
                            </Button>
                          )}

                          {query.status !== "resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveQuery(query.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
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

        {/* Pagination */}
        {queries && queries.totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {queries.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === queries.totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Admin Reply Form */}
        {selectedQuery && (
          <AdminReplyForm
            queryId={selectedQuery.id}
            isOpen={showReplyForm}
            onClose={() => setShowReplyForm(false)}
            onSubmit={handleSendReply}
            isLoading={false}
          />
        )}
      </div>
    </AdminLayout>
  );
}
