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
import {
  Search,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  User,
  Paperclip,
  Send,
  Download,
  RefreshCw,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";

interface QueryAttachment {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  uploadedAt: string;
}

interface QueryResponse {
  id: string;
  message: string;
  respondedBy: string;
  respondedAt: string;
  isFromAdmin: boolean;
}

interface AdminQueryType {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  submittedBy: string;
  submittedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  responses?: QueryResponse[];
  attachments?: QueryAttachment[];
}

export default function AdminOpenQueriesPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queries, setQueries] = useState<AdminQueryType[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<AdminQueryType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<AdminQueryType | null>(
    null
  );
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth);
        if (auth.isAuthenticated && new Date(auth.expiresAt) > new Date()) {
          setAdmin(auth.admin);
          loadOpenQueries();
        } else {
          localStorage.removeItem("adminAuth");
          router.push("/admin/login");
        }
      } catch {
        localStorage.removeItem("adminAuth");
        router.push("/admin/login");
      }
    } else {
      router.push("/admin/login");
    }
    setIsLoading(false);
  }, [router]);

  const loadOpenQueries = () => {
    // Mock query data - filtered to only show open queries
    const mockQueries: AdminQueryType[] = [
      {
        id: "Q-2024-001",
        subject: "Dispute parking violation",
        category: "violation_dispute",
        description:
          "I believe my bike was properly parked in the designated area. The violation seems to be incorrectly issued.",
        status: "open",
        priority: "medium",
        submittedBy: "john.doe@example.com",
        submittedAt: "2024-01-15T10:30:00Z",
        attachments: [
          {
            id: "att-1",
            filename: "parking_photo.jpg",
            url: "/attachments/parking_photo.jpg",
            fileSize: 2048000,
            uploadedAt: "2024-01-15T10:30:00Z",
          },
        ],
      },
      {
        id: "Q-2024-004",
        subject: "General inquiry about bike lanes",
        category: "general",
        description:
          "I would like to know more about the new bike lane regulations in downtown area.",
        status: "open",
        priority: "low",
        submittedBy: "sarah.johnson@example.com",
        submittedAt: "2024-01-15T14:20:00Z",
      },
      {
        id: "Q-2024-005",
        subject: "Unable to upload evidence",
        category: "technical_support",
        description:
          "The evidence upload feature is not working when I try to submit supporting documents for my case.",
        status: "open",
        priority: "high",
        submittedBy: "mike.davis@example.com",
        submittedAt: "2024-01-15T16:45:00Z",
      },
      {
        id: "Q-2024-006",
        subject: "Wrong violation amount charged",
        category: "payment_issue",
        description:
          "I was charged $100 but the violation notice says $75. Please clarify the correct amount.",
        status: "open",
        priority: "high",
        submittedBy: "anna.wilson@example.com",
        submittedAt: "2024-01-15T18:10:00Z",
      },
      {
        id: "Q-2024-007",
        subject: "Request for violation history",
        category: "general",
        description:
          "Can I get a complete history of all violations associated with my account for the past year?",
        status: "open",
        priority: "low",
        submittedBy: "robert.brown@example.com",
        submittedAt: "2024-01-16T08:30:00Z",
      },
      {
        id: "Q-2024-008",
        subject: "Bike registration not updating",
        category: "technical_support",
        description:
          "I updated my bike registration information but it's not reflecting in the system.",
        status: "open",
        priority: "medium",
        submittedBy: "lisa.garcia@example.com",
        submittedAt: "2024-01-16T11:15:00Z",
      },
    ];
    setQueries(mockQueries);
    setFilteredQueries(mockQueries);
  };

  useEffect(() => {
    // Filter queries based on search and filter criteria
    let filtered = queries;

    if (searchTerm) {
      filtered = filtered.filter(
        (query) =>
          query.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((query) => query.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((query) => query.priority === priorityFilter);
    }

    setFilteredQueries(filtered);
  }, [queries, searchTerm, categoryFilter, priorityFilter]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  const handleAssignQuery = (queryId: string) => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              status: "in_progress" as const,
              assignedTo: admin?.id,
            }
          : q
      )
    );
    // Remove from open queries list since it's now in progress
    setFilteredQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

  const handleSendResponse = (queryId: string, message: string) => {
    const newResponse = {
      id: `resp-${Date.now()}`,
      message,
      respondedBy: admin?.id || "admin",
      respondedAt: new Date().toISOString(),
      isFromAdmin: true,
    };

    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              responses: [...(q.responses || []), newResponse],
              status: "in_progress" as const,
              assignedTo: admin?.id,
            }
          : q
      )
    );

    // Remove from open queries list since it's now in progress
    setFilteredQueries((prev) => prev.filter((q) => q.id !== queryId));
    setResponseText("");
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
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
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
    const categories: Record<string, string> = {
      violation_dispute: "Violation Dispute",
      technical_support: "Technical Support",
      payment_issue: "Payment Issue",
      general: "General Inquiry",
      account_issue: "Account Issue",
    };
    return categories[category] || category;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTimeSinceSubmission = (submittedAt: string) => {
    const now = new Date();
    const submitted = new Date(submittedAt);
    const diffInHours = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Less than 1 hour";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading open queries...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // Count by priority for quick stats
  const highPriorityCount = filteredQueries.filter(
    (q) => q.priority === "high"
  ).length;
  const mediumPriorityCount = filteredQueries.filter(
    (q) => q.priority === "medium"
  ).length;
  const lowPriorityCount = filteredQueries.filter(
    (q) => q.priority === "low"
  ).length;

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin/dashboard" },
    { label: "Queries", href: "/admin/queries" },
    { label: "Open Queries" },
  ];

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-yellow-600" />
              Open Queries
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage queries that need immediate attention
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadOpenQueries}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/queries")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              All Queries
            </Button>
          </div>
        </div>

        {/* Priority Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    High Priority
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {highPriorityCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Medium Priority
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mediumPriorityCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Low Priority
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lowPriorityCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Open
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredQueries.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search open queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="violation_dispute">
                    Violation Dispute
                  </SelectItem>
                  <SelectItem value="technical_support">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Open Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Open Queries ({filteredQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQueries.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Open Queries
                </h3>
                <p className="text-gray-600">
                  All queries have been assigned or resolved!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Time Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => (
                    <TableRow key={query.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{query.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium truncate">
                            {query.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {query.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(query.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {query.submittedBy}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(query.submittedAt)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p
                            className={`font-medium ${
                              getTimeSinceSubmission(
                                query.submittedAt
                              ).includes("days")
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {getTimeSinceSubmission(query.submittedAt)}
                          </p>
                        </div>
                      </TableCell>
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
                                <DialogTitle className="flex items-center">
                                  <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                                  Open Query - {query.id}
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
                                      <h4 className="font-semibold">
                                        Submitted
                                      </h4>
                                      <p className="text-sm">
                                        {formatDateTime(
                                          selectedQuery.submittedAt
                                        )}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {getTimeSinceSubmission(
                                          selectedQuery.submittedAt
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold">
                                      Description
                                    </h4>
                                    <p className="mt-2 p-3 bg-gray-50 rounded-md">
                                      {selectedQuery.description}
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

                                  <div>
                                    <h4 className="font-semibold">
                                      Respond to Query
                                    </h4>
                                    <div className="mt-2 space-y-3">
                                      <Textarea
                                        placeholder="Type your response..."
                                        value={responseText}
                                        onChange={(e) =>
                                          setResponseText(e.target.value)
                                        }
                                        rows={4}
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          onClick={() =>
                                            handleSendResponse(
                                              selectedQuery.id,
                                              responseText
                                            )
                                          }
                                          disabled={!responseText.trim()}
                                        >
                                          <Send className="w-4 h-4 mr-2" />
                                          Send Response & Assign to Me
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            handleAssignQuery(selectedQuery.id)
                                          }
                                        >
                                          <UserPlus className="w-4 h-4 mr-2" />
                                          Assign to Me
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            onClick={() => handleAssignQuery(query.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
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
