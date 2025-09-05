"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Edit, UserCheck, UserX, Mail, Phone, 
  DollarSign, AlertTriangle, CheckCircle, XCircle, Calendar,
  MapPin, Car,  Clock, Trash2, MoreHorizontal,RefreshCw
} from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

import { AdminLayout } from "@/components/admin/admin-layout";
import { useUserDetails, useUserOperations, type AdminUser } from "@/lib/hooks/use-admin-users";
import { validateAdminSession } from "@/lib/admin-utils";
import { Violation } from "@/types/violation";

type Role = "user" | "admin" | "super_admin";

// Local admin shape expected by AdminLayout
type LocalAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
};

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

// Violation Status Badge Component
function ViolationStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400" };
      case "approved":
        return { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400" };
      case "rejected":
        return { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400" };
      case "appealed":
        return { label: "Appealed", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400" };
    }
  };

  const config = getStatusConfig(status);
  return <Badge className={config.className}>{config.label}</Badge>;
}

// Payment Status Badge Component
function PaymentStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Paid", className: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400" };
      case "pending":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400" };
      case "overdue":
        return { label: "Overdue", className: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400" };
    }
  };

  const config = getStatusConfig(status);
  return <Badge className={config.className}>{config.label}</Badge>;
}

// Edit User Dialog Component
function EditUserDialog({ user, open, onOpenChange, onSuccess }: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    numberPlate: string;
    phoneNumber: string;
    address: string;
    role: Role;
    notes: string;
  }>({ name: "", email: "", numberPlate: "", phoneNumber: "", address: "", role: "user", notes: "" });
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUserOperations();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        numberPlate: user.numberPlate || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        role: (user.role as Role) || "user",
        notes: user.notes || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUser(user.id, formData);
      onOpenChange(false);
      onSuccess();
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information.</DialogDescription>
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
              <Label htmlFor="numberPlate">Number Plate</Label>
              <Input id="numberPlate" value={formData.numberPlate} onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
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
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [admin, setAdmin] = useState<LocalAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(isEditMode);

  const { user, loading, error, refetch } = useUserDetails(userId);
  const { deleteUser, suspendUser, activateUser, verifyEmail, verifyPhone } = useUserOperations();

  // Validate admin session
  useEffect(() => {
    const validateSession = async () => {
      try {
        const adminData = await validateAdminSession();
        if (adminData) {
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

  const handleAction = async (action: string, data?: { reason?: string } | undefined) => {
    if (!user) return;

    try {
      switch (action) {
        case "suspend":
          await suspendUser(user.id, data?.reason);
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
          if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            await deleteUser(user.id);
            router.push("/admin/users");
          }
          break;
      }
      refetch();
    } catch {
      // Error handled by hook
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

  if (loading) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading user details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout admin={admin} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error: {error || "User not found"}</div>
            <Button onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // recentViolations may be attached by the backend; safe-read it here
  const recentViolations: Violation[] = (user as unknown as { recentViolations?: Violation[] }).recentViolations ?? [];

  return (
    <AdminLayout admin={admin} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
              <p className="text-muted-foreground mt-1">Manage user information and view violation history</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
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
          </div>
        </div>

        {/* User Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-lg">
                      {(user.name || "").split(" ").map(n => (n ? n[0] : "")).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <StatusBadge status={user.status} />
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Number Plate</p>
                      <p className="text-sm text-muted-foreground">
                        {user.numberPlate || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">
                        {user.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {user.address || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Registered</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user.lastLoginAt && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Login</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.lastLoginAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Verification</span>
                    <VerificationBadge verified={user.emailVerified} type="email" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phone Verification</span>
                    <VerificationBadge verified={user.phoneVerified} type="phone" />
                  </div>
                </div>

                {user.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{user.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Violations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.violationCount}</div>
                  <p className="text-xs text-muted-foreground">violations recorded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(user.totalFines ?? 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">total amount</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(user.outstandingFines ?? 0).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">unpaid amount</p>
                </CardContent>
              </Card>
            </div>

            {/* Violations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Violation History</CardTitle>
                <CardDescription>Recent violations and their status</CardDescription>
              </CardHeader>
              <CardContent>
        {recentViolations && recentViolations.length > 0 ? (
          <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentViolations.map((violation: Violation) => (
                        <TableRow key={violation.id}>
                          <TableCell>
                            {new Date(violation.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{violation.type}</div>
                              <div className="text-sm text-muted-foreground">{violation.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{violation.location}</TableCell>
                          <TableCell>{violation.fine ? `$${violation.fine.toFixed(2)}` : "—"}</TableCell>
                          <TableCell>
                            <ViolationStatusBadge status={violation.status || "pending"} />
                          </TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={violation.paymentStatus || "pending"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No violations found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This user has a clean record.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <EditUserDialog 
        user={user} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSuccess={refetch} 
      />
    </AdminLayout>
  );
}
