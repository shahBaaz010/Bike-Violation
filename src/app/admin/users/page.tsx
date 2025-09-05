"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, 
  UserCheck, UserX, Mail, Phone, DollarSign, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, UserPlus
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdminUsers, useUserStats, useUserOperations, type AdminUser, type UserFilters } from "@/lib/hooks/use-admin-users";
import { validateAdminSession } from "@/lib/admin-utils";

// Small local types to avoid implicit `any`
type Role = "user" | "admin" | "super_admin";

// Local admin type matching AdminLayout's expected shape
// admin shape passed to AdminLayout
type LocalAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
};

// Create User Dialog Component
function CreateUserDialog({ open, onOpenChange, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    numberPlate: string;
    phoneNumber: string;
    address: string;
    role: Role;
    notes: string;
  }>({
    name: "",
    email: "",
    password: "",
    numberPlate: "",
    phoneNumber: "",
    address: "",
    role: "user",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { createUser } = useUserOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(formData);
      setFormData({ name: "", email: "", password: "", numberPlate: "", phoneNumber: "", address: "", role: "user", notes: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberPlate">Number Plate</Label>
              <Input id="numberPlate" value={formData.numberPlate} onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// User Actions Component
function UserActions({ user, onAction }: { user: AdminUser; onAction: () => void }) {
  const { deleteUser, suspendUser, activateUser, verifyEmail, verifyPhone } = useUserOperations();
  const router = useRouter();

  const handleAction = async (action: string, data?: unknown) => {
    try {
      switch (action) {
        case "view":
          router.push(`/admin/users/${user.id}`);
          break;
        case "edit":
          router.push(`/admin/users/${user.id}?edit=true`);
          break;
        case "suspend": {
          const payload = data as { reason?: string } | undefined;
          await suspendUser(user.id, payload?.reason);
          break;
        }
          break;
        case "activate":
          await activateUser(user.id);
          break;
        case "verifyEmail":
          await verifyEmail(user.id);
          break;
        case "verifyPhone":
          await verifyPhone(user.id);
          break;
        case "delete":
          if (confirm("Are you sure you want to delete this user?")) {
            await deleteUser(user.id);
          }
          break;
      }
      onAction();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleAction("view")}>
          <Eye className="mr-2 h-4 w-4" />View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("edit")}>
          <Edit className="mr-2 h-4 w-4" />Edit User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.status === "active" ? (
          <DropdownMenuItem onClick={() => handleAction("suspend")}>
            <UserX className="mr-2 h-4 w-4" />Suspend User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleAction("activate")}>
            <UserCheck className="mr-2 h-4 w-4" />Activate User
          </DropdownMenuItem>
        )}
        {!user.emailVerified && (
          <DropdownMenuItem onClick={() => handleAction("verifyEmail")}>
            <Mail className="mr-2 h-4 w-4" />Verify Email
          </DropdownMenuItem>
        )}
        {!user.phoneVerified && (
          <DropdownMenuItem onClick={() => handleAction("verifyPhone")}>
            <Phone className="mr-2 h-4 w-4" />Verify Phone
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAction("delete")} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400" };
      case "suspended":
        return { label: "Suspended", className: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400" };
      case "inactive":
        return { label: "Inactive", className: "bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400" };
    }
  };

  const config = getStatusConfig(status);
  return <Badge className={config.className}>{config.label}</Badge>;
}

// Verification Badge Component
function VerificationBadge({ verified, type }: { verified: boolean; type: "email" | "phone" }) {
  if (verified) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400">
        <CheckCircle className="mr-1 h-3 w-3" />
        {type === "email" ? "Email" : "Phone"} Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <XCircle className="mr-1 h-3 w-3" />
      {type === "email" ? "Email" : "Phone"} Not Verified
    </Badge>
  );
}

// Main Component
export default function AdminUsersPage() {
  const [admin, setAdmin] = useState<LocalAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({});
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { users, loading, error, total, totalPages, refetch } = useAdminUsers(filters, page, 10);
  const { stats } = useUserStats();
  const { bulkUpdate } = useUserOperations();

  // Validate admin session
  useEffect(() => {
    const validateSession = async () => {
      try {
        const adminData = await validateAdminSession();
        if (adminData) {
          // validateAdminSession returns AdminAuth; extract admin field
          setAdmin(adminData.admin);
        } else {
          window.location.href = "/admin/login";
        }
      } catch {
          console.error("Session validation failed");
          window.location.href = "/admin/login";
        } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/admin/login";
  };

  const handleFilterChange = (key: keyof UserFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to perform this action");
      return;
    }

    try {
      await bulkUpdate(selectedUsers, action, data);
      setSelectedUsers([]);
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    if (isChecked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    if (isChecked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
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

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all user data. Access each user’s violation history.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{stats.overview.activePercentage}% active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.activeUsers}</div>
                <p className="text-xs text-muted-foreground">{stats.overview.activePercentage}% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.violations.usersWithViolations}</div>
                <p className="text-xs text-muted-foreground">{stats.violations.usersWithViolationsPercentage}% of users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.violations.usersWithOutstandingFines}</div>
                <p className="text-xs text-muted-foreground">{stats.violations.usersWithOutstandingFinesPercentage}% of users</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={filters.role || ""} onValueChange={(value) => handleFilterChange("role", value)}>
                  <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Has Violations</Label>
                <Select value={filters.hasViolations?.toString() || ""} onValueChange={(value) => handleFilterChange("hasViolations", value === "true")}>
                  <SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All users</SelectItem>
                    <SelectItem value="true">With violations</SelectItem>
                    <SelectItem value="false">Without violations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{selectedUsers.length} user(s) selected</p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("activate")}>
                    <UserCheck className="mr-2 h-4 w-4" />Activate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("suspend")}>
                    <UserX className="mr-2 h-4 w-4" />Suspend
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("verifyEmail")}>
                    <Mail className="mr-2 h-4 w-4" />Verify Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users ({total})</CardTitle>
                <CardDescription>Showing {users.length} of {total} users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-600">Error: {error}</div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No users found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or create a new user.</p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Fines</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {(user.name || "").split(" ").map(n => (n ? n[0] : "")).join("").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.numberPlate || "No plate"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{user.email}</div>
                            {user.phoneNumber && (
                              <div className="text-sm text-muted-foreground">{user.phoneNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <StatusBadge status={user.status} />
                            <div className="flex space-x-1">
                              <VerificationBadge verified={user.emailVerified} type="email" />
                              <VerificationBadge verified={user.phoneVerified} type="phone" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{user.violationCount}</div>
                            <div className="text-muted-foreground">violations</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">${(user.totalFines ?? 0).toFixed(2)}</div>
                            <div className="text-muted-foreground">${(user.outstandingFines ?? 0).toFixed(2)} outstanding</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserActions user={user} onAction={refetch} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={refetch} />
    </AdminLayout>
  );
}
