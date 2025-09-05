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
  Settings,
  Monitor,
  Smartphone,
  Globe,
  Database,
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
  deviceInfo?: {
    type: string;
    browser: string;
    os: string;
  };
  issueType?: string;
}

export default function AdminTechnicalQueriesPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queries, setQueries] = useState<AdminQueryType[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<AdminQueryType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState("all");
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
          loadTechnicalQueries();
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

  const loadTechnicalQueries = () => {
    // Mock technical support queries
    const mockQueries: AdminQueryType[] = [
      {
        id: "Q-2024-002",
        subject: "Account login issues",
        category: "technical_support",
        description:
          "I am unable to log into my account. The password reset email is not being received.",
        status: "in_progress",
        priority: "high",
        submittedBy: "jane.smith@example.com",
        submittedAt: "2024-01-14T16:45:00Z",
        assignedTo: "admin-support-01",
        issueType: "authentication",
        deviceInfo: {
          type: "Desktop",
          browser: "Chrome 120",
          os: "Windows 11",
        },
        responses: [
          {
            id: "resp-1",
            message:
              "We've identified the issue with email delivery. Please try the password reset again.",
            respondedBy: "admin-support-01",
            respondedAt: "2024-01-14T17:00:00Z",
            isFromAdmin: true,
          },
        ],
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
        issueType: "file_upload",
        deviceInfo: {
          type: "Mobile",
          browser: "Safari iOS",
          os: "iOS 17",
        },
        attachments: [
          {
            id: "att-2",
            filename: "error_screenshot.png",
            url: "/attachments/error_screenshot.png",
            fileSize: 1024000,
            uploadedAt: "2024-01-15T16:45:00Z",
          },
        ],
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
        issueType: "data_sync",
        deviceInfo: {
          type: "Desktop",
          browser: "Firefox 121",
          os: "macOS 14",
        },
      },
      {
        id: "Q-2024-009",
        subject: "Mobile app crashes on startup",
        category: "technical_support",
        description:
          "The mobile app keeps crashing immediately after I open it. This has been happening for the past 3 days.",
        status: "resolved",
        priority: "high",
        submittedBy: "carlos.rodriguez@example.com",
        submittedAt: "2024-01-13T08:30:00Z",
        resolvedAt: "2024-01-14T10:15:00Z",
        assignedTo: "admin-mobile-01",
        issueType: "mobile_app",
        deviceInfo: {
          type: "Mobile",
          browser: "Mobile App",
          os: "Android 14",
        },
        responses: [
          {
            id: "resp-3",
            message:
              "This was caused by a bug in version 2.1.0. Please update to version 2.1.1 which fixes this issue.",
            respondedBy: "admin-mobile-01",
            respondedAt: "2024-01-14T10:15:00Z",
            isFromAdmin: true,
          },
        ],
      },
      {
        id: "Q-2024-010",
        subject: "Website not loading properly",
        category: "technical_support",
        description:
          "The website loads very slowly and some pages show errors. This happens on multiple devices.",
        status: "in_progress",
        priority: "medium",
        submittedBy: "amy.johnson@example.com",
        submittedAt: "2024-01-15T20:30:00Z",
        assignedTo: "admin-web-01",
        issueType: "website_performance",
        deviceInfo: {
          type: "Desktop",
          browser: "Edge 120",
          os: "Windows 10",
        },
      },
      {
        id: "Q-2024-011",
        subject: "API connection timeout",
        category: "technical_support",
        description:
          "My third-party integration keeps getting timeout errors when connecting to your API endpoints.",
        status: "open",
        priority: "high",
        submittedBy: "dev.team@bikecompany.com",
        submittedAt: "2024-01-16T14:45:00Z",
        issueType: "api_integration",
        deviceInfo: {
          type: "Server",
          browser: "API Client",
          os: "Linux",
        },
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

    if (statusFilter !== "all") {
      filtered = filtered.filter((query) => query.status === statusFilter);
    }

    if (issueTypeFilter !== "all") {
      filtered = filtered.filter(
        (query) => query.issueType === issueTypeFilter
      );
    }

    setFilteredQueries(filtered);
  }, [queries, searchTerm, statusFilter, issueTypeFilter]);

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
  };

  const handleResolveQuery = (queryId: string) => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
            }
          : q
      )
    );
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
              status: q.status === "open" ? ("in_progress" as const) : q.status,
              assignedTo: q.assignedTo || admin?.id,
            }
          : q
      )
    );

    setResponseText("");
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
            <Settings className="w-3 h-3 mr-1" />
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

  const getIssueTypeLabel = (issueType: string) => {
    const types: Record<string, string> = {
      authentication: "Authentication",
      file_upload: "File Upload",
      data_sync: "Data Sync",
      mobile_app: "Mobile App",
      website_performance: "Website Performance",
      api_integration: "API Integration",
      database: "Database",
      security: "Security",
    };
    return types[issueType] || issueType;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "server":
        return <Database className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading technical queries...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // Count by status for quick stats
  const openCount = filteredQueries.filter((q) => q.status === "open").length;
  const inProgressCount = filteredQueries.filter(
    (q) => q.status === "in_progress"
  ).length;
  const resolvedCount = filteredQueries.filter(
    (q) => q.status === "resolved"
  ).length;

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin/dashboard" },
    { label: "Queries", href: "/admin/queries" },
    { label: "Technical Support" },
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
              <Settings className="w-8 h-8 mr-3 text-blue-600" />
              Technical Support Queries
            </h1>
            <p className="text-gray-600 mt-1">
              Manage technical issues and system-related queries
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadTechnicalQueries}>
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

        {/* Status Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {openCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Settings className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressCount}
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
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resolvedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
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
                    placeholder="Search technical queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Settings className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={issueTypeFilter}
                onValueChange={setIssueTypeFilter}
              >
                <SelectTrigger className="w-full md:w-48">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issue Types</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                  <SelectItem value="data_sync">Data Sync</SelectItem>
                  <SelectItem value="mobile_app">Mobile App</SelectItem>
                  <SelectItem value="website_performance">
                    Website Performance
                  </SelectItem>
                  <SelectItem value="api_integration">
                    API Integration
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Technical Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Technical Support Queries ({filteredQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Device/Platform</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{query.id}</TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="font-medium truncate">{query.subject}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {query.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getIssueTypeLabel(query.issueType || "general")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(query.deviceInfo?.type || "unknown")}
                        <div>
                          <p className="text-sm font-medium">
                            {query.deviceInfo?.type || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {query.deviceInfo?.browser} • {query.deviceInfo?.os}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                    <TableCell>{getStatusBadge(query.status)}</TableCell>
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
                                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                                Technical Query - {query.id}
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
                                      Issue Type
                                    </h4>
                                    <Badge variant="outline">
                                      {getIssueTypeLabel(
                                        selectedQuery.issueType || "general"
                                      )}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Priority</h4>
                                    {getPriorityBadge(selectedQuery.priority)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Status</h4>
                                    {getStatusBadge(selectedQuery.status)}
                                  </div>
                                </div>

                                {selectedQuery.deviceInfo && (
                                  <div>
                                    <h4 className="font-semibold">
                                      Device Information
                                    </h4>
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">
                                            Device Type
                                          </p>
                                          <div className="flex items-center mt-1">
                                            {getDeviceIcon(
                                              selectedQuery.deviceInfo.type
                                            )}
                                            <span className="ml-2 text-sm">
                                              {selectedQuery.deviceInfo.type}
                                            </span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            Browser
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {selectedQuery.deviceInfo.browser}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">
                                            Operating System
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {selectedQuery.deviceInfo.os}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-semibold">Description</h4>
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
                                                    ? "Tech Support"
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

                                {selectedQuery.status !== "resolved" && (
                                  <div>
                                    <h4 className="font-semibold">
                                      Technical Response
                                    </h4>
                                    <div className="mt-2 space-y-3">
                                      <Textarea
                                        placeholder="Provide technical solution or next steps..."
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
                                          Send Technical Response
                                        </Button>
                                        {selectedQuery.status === "open" && (
                                          <Button
                                            variant="outline"
                                            onClick={() =>
                                              handleAssignQuery(
                                                selectedQuery.id
                                              )
                                            }
                                          >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Assign to Me
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            handleResolveQuery(selectedQuery.id)
                                          }
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark as Resolved
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {query.status === "open" && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignQuery(query.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
