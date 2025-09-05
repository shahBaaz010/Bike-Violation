"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  History,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

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

export default function QueriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [queries, setQueries] = useState<Query[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  // Form state
  const [form, setForm] = useState({
    subject: "",
    message: "",
    category: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        loadQueries(user.id);

        // Check if there's a case parameter for pre-filling
        const caseId = searchParams.get("case");
        if (caseId) {
          setForm(prev => ({
            ...prev,
            subject: `Query about case ${caseId}`,
            category: "violation_dispute",
          }));
        }
      }
    }
  }, [authLoading, isAuthenticated, user, router, searchParams]);

  const loadQueries = async (userId: string) => {
    setIsLoadingQueries(true);
    try {
      const response = await fetch(`/api/queries?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setQueries(result.data.data || []);
      } else {
        console.error("Failed to load queries:", result.error);
        setQueries([]);
      }
    } catch (error) {
      console.error("Error loading queries:", error);
      setQueries([]);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  const handleLogout = () => {
    try {
      if (typeof logout === "function") logout();
    } catch {
      localStorage.removeItem("auth");
    }
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim() || !form.category || !user) return;

    setIsSubmitting(true);
    try {
      const queryData = {
        userId: user.id,
        subject: form.subject,
        message: form.message,
        category: form.category as Query["category"],
        priority: "medium" as const,
        isUrgent: false,
      };

      const response = await fetch("/api/queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Query sent successfully!");
        setForm({ subject: "", message: "", category: "" });
        setActiveTab("history");
        // Reload queries to show the new one
        await loadQueries(user.id);
      } else {
        toast.error(result.error || "Failed to send query");
      }
    } catch (error) {
      console.error("Error submitting query:", error);
      toast.error("Failed to send query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contact Admin</h1>
            <p className="text-muted-foreground mt-1">
              Send queries to admin and view your query history.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Support Center</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Query</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Query History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={form.category}
                        onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="violation_dispute">Violation Dispute</SelectItem>
                          <SelectItem value="payment_issues">Payment Issues</SelectItem>
                          <SelectItem value="technical_support">Technical Support</SelectItem>
                          <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your query"
                        value={form.subject}
                        onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide detailed information about your query..."
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setForm({ subject: "", message: "", category: "" })}
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={!form.subject.trim() || !form.message.trim() || !form.category || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Query
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                {isLoadingQueries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading queries...</span>
                  </div>
                ) : queries.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No queries found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You have not sent any queries yet.
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
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell className="font-medium">{query.id}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Show query details in a dialog
                                console.log("View query details:", query);
                                toast.info("Query details view coming soon!");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
