"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useUsers,
  useCases,
  useQueries,
  useAllStats,
} from "@/lib/database/hooks";
import {
  CreateUserRequest,
  CreateCaseRequest,
  CreateQueryRequest,
} from "@/lib/database/models";
import { Loader2, Plus } from "lucide-react";

type Role = "user" | "admin" | "super_admin";
type ViolationType =
  | "speeding"
  | "parking"
  | "traffic_light"
  | "no_helmet"
  | "wrong_lane"
  | "mobile_use"
  | "other";

export default function DatabaseTestPage() {
  // Database hooks
  const {
    users,
    loading: usersLoading,
    error: usersError,
    createUser,
  } = useUsers();
  const {
    cases,
    loading: casesLoading,
    error: casesError,
    createCase,
  } = useCases();
  const {
    queries,
    loading: queriesLoading,
    error: queriesError,
    createQuery,
  } = useQueries();
  const { stats, loading: statsLoading } = useAllStats();

  // Form states
  const [userForm, setUserForm] = useState<CreateUserRequest>({
    name: "",
    email: "",
    password: "",
    numberPlate: "",
    role: "user",
  });

  const [caseForm, setCaseForm] = useState<CreateCaseRequest>({
    userId: "",
    violationType: "speeding",
    violation: "",
    fine: 0,
    proofUrl: "",
    location: "",
    date: "",
    dueDate: "",
  });

  const [queryForm, setQueryForm] = useState<CreateQueryRequest>({
    userId: "",
    subject: "",
    message: "",
    category: "general_inquiry",
    priority: "medium",
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      setUserForm({
        name: "",
        email: "",
        password: "",
        numberPlate: "",
        role: "user",
      });
      alert("User created successfully!");
    } catch (error) {
      alert("Error creating user: " + (error as Error).message);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCase(caseForm);
      setCaseForm({
        userId: "",
        violationType: "speeding",
        violation: "",
        fine: 0,
        proofUrl: "",
        location: "",
        date: "",
        dueDate: "",
      });
      alert("Case created successfully!");
    } catch (error) {
      alert("Error creating case: " + (error as Error).message);
    }
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuery(queryForm);
      setQueryForm({
        userId: "",
        subject: "",
        message: "",
        category: "general_inquiry",
        priority: "medium",
      });
      alert("Query created successfully!");
    } catch (error) {
      alert("Error creating query: " + (error as Error).message);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Database System Test</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Bike Violation Management System
        </Badge>
      </div>

      {/* Statistics Overview */}
      {statsLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </CardContent>
        </Card>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <Badge>{stats.users.totalUsers}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Users:</span>
                <Badge variant="outline">{stats.users.activeUsers}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Admins:</span>
                <Badge variant="secondary">
                  {stats.users.usersByRole.admin}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cases Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Cases:</span>
                <Badge>{stats.cases.totalCases}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.cases.pendingCases}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Fines:</span>
                <Badge variant="outline">${stats.cases.totalFines}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queries Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Queries:</span>
                <Badge>{stats.queries.totalQueries}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Open:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.queries.openQueries}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Resolved:</span>
                <Badge className="bg-green-100 text-green-800">
                  {stats.queries.resolvedQueries}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Database Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="cases">Cases Management</TabsTrigger>
          <TabsTrigger value="queries">Queries Management</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create User Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New User</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Name</Label>
                    <Input
                      id="userName"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPassword">Password</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPlate">Number Plate</Label>
                    <Input
                      id="userPlate"
                      value={userForm.numberPlate}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          numberPlate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="userRole">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) =>
                        setUserForm({ ...userForm, role: value as Role })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Create User
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Users List</span>
                  {usersLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersError ? (
                  <p className="text-red-600">Error: {usersError}</p>
                ) : users ? (
                  <div className="space-y-2">
                    {users.data.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            {user.numberPlate}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No users found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Case Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Case</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCase} className="space-y-4">
                  <div>
                    <Label htmlFor="caseUserId">User ID</Label>
                    <Input
                      id="caseUserId"
                      value={caseForm.userId}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, userId: e.target.value })
                      }
                      placeholder="user-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="violationType">Violation Type</Label>
                    <Select
                      value={caseForm.violationType}
                      onValueChange={(value) =>
                        setCaseForm({
                          ...caseForm,
                          violationType: value as ViolationType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speeding">Speeding</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="traffic_light">
                          Traffic Light
                        </SelectItem>
                        <SelectItem value="no_helmet">No Helmet</SelectItem>
                        <SelectItem value="wrong_lane">Wrong Lane</SelectItem>
                        <SelectItem value="mobile_use">Mobile Use</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="violation">Violation Description</Label>
                    <Textarea
                      id="violation"
                      value={caseForm.violation}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, violation: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fine">Fine Amount</Label>
                    <Input
                      id="fine"
                      type="number"
                      value={caseForm.fine}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          fine: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={caseForm.location}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Violation Date</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={caseForm.date}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="proofUrl">Proof URL</Label>
                    <Input
                      id="proofUrl"
                      value={caseForm.proofUrl}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, proofUrl: e.target.value })
                      }
                      placeholder="/images/proof.jpg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={caseForm.dueDate}
                      onChange={(e) =>
                        setCaseForm({ ...caseForm, dueDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Case
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cases List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Cases List</span>
                  {casesLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {casesError ? (
                  <p className="text-red-600">Error: {casesError}</p>
                ) : cases ? (
                  <div className="space-y-2">
                    {cases.data.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="p-3 border rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {caseItem.violationType}
                          </p>
                          <Badge
                            variant={
                              caseItem.status === "paid" ? "default" : "outline"
                            }
                          >
                            {caseItem.status}
                          </Badge>
                        </div>
                        <p className="text-sm">{caseItem.violation}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Fine: ${caseItem.fine}</span>
                          <span>{formatDateTime(caseItem.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No cases found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Queries Tab */}
        <TabsContent value="queries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Query Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Query</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateQuery} className="space-y-4">
                  <div>
                    <Label htmlFor="queryUserId">User ID</Label>
                    <Input
                      id="queryUserId"
                      value={queryForm.userId}
                      onChange={(e) =>
                        setQueryForm({ ...queryForm, userId: e.target.value })
                      }
                      placeholder="user-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={queryForm.subject}
                      onChange={(e) =>
                        setQueryForm({ ...queryForm, subject: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={queryForm.message}
                      onChange={(e) =>
                        setQueryForm({ ...queryForm, message: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={queryForm.category}
                      onValueChange={(value) =>
                        setQueryForm({ ...queryForm, category: value as CreateQueryRequest['category'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={queryForm.priority || "medium"}
                      onValueChange={(value) =>
                        setQueryForm({ ...queryForm, priority: value as CreateQueryRequest['priority'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Query
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Queries List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Queries List</span>
                  {queriesLoading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {queriesError ? (
                  <p className="text-red-600">Error: {queriesError}</p>
                ) : queries ? (
                  <div className="space-y-2">
                    {queries.data.map((query) => (
                      <div
                        key={query.id}
                        className="p-3 border rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{query.subject}</p>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{query.category}</Badge>
                            <Badge
                              variant={
                                query.priority === "high"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {query.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{query.message}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Status: {query.status}</span>
                          <span>{formatDateTime(query.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No queries found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
