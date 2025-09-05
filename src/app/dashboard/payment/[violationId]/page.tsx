"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  DollarSign,
  CreditCard,
  CheckCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  Lock,
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
}

interface PaymentForm {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const violationId = params.violationId as string;
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  // removed unused isLoading state
  const [violation, setViolation] = useState<Violation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingViolation, setIsLoadingViolation] = useState(false);

  const [form, setForm] = useState<PaymentForm>({
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const loadViolation = useCallback(async (userId: string) => {
    setIsLoadingViolation(true);
    try {
      const response = await fetch(`/api/users/violations?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        const foundViolation = result.data.find((v: Violation) => v.id === violationId);
        if (foundViolation) {
          setViolation(foundViolation);
        } else {
          router.push("/dashboard/violations");
        }
      } else {
        console.error("Failed to load violations:", result.error);
        router.push("/dashboard/violations");
      }
    } catch (error) {
      console.error("Error loading violation:", error);
      router.push("/dashboard/violations");
    } finally {
      setIsLoadingViolation(false);
    }
  }, [violationId, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        loadViolation(user.id);
      }
    }
  }, [authLoading, isAuthenticated, user, router, violationId, loadViolation]);

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
    if (!violation) return;

    setIsProcessing(true);
    try {
      // Mock payment processing - replace with actual payment gateway
      console.log("Processing payment:", {
        violationId: violation.id,
        amount: violation.fine,
        cardNumber: form.cardNumber.slice(-4),
        cardHolder: form.cardHolder,
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful payment
      // Update case status on the server to 'paid'
      try {
        const res = await fetch(`/api/cases/${violation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paid" }),
        });
        const data = await res.json();
        if (!data || !data.success) {
          console.error("Failed to update case status:", data?.error || data);
          throw new Error(data?.error || "Failed to update case status");
        }

        // Update local violation state
        setViolation(prev => prev ? { ...prev, status: "paid" } : prev);
      } catch (err) {
        console.error("Error updating case status:", err);
        alert("Payment processed but failed to update case status. Please contact support.");
        return;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400">
            Paid
          </Badge>
        );
      case "disputed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400">
            Disputed
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
            Resolved
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoadingViolation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !violation) {
    return null;
  }

  if (isSuccess) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your payment of {formatCurrency(violation.fine || 0)} has been processed successfully.
                The violation case {violation.id} has been marked as paid.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/dashboard/violations")}
                  className="w-full"
                >
                  View My Cases
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/violations")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pay Fine</h1>
            <p className="text-muted-foreground mt-1">
              Complete your payment for violation case {violation.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Violation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Violation Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Case Number</Label>
                  <p className="font-medium">{violation.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  {getStatusBadge(violation.status)}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Violation Type</Label>
                  <p className="font-medium">{violation.violationType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fine Amount</Label>
                  <p className="font-medium text-lg text-green-600 dark:text-green-400">
                    {formatCurrency(violation.fine || 0)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{violation.violation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{violation.location}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{formatDate(violation.date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="pl-10"
                      maxLength={19}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardHolder">Cardholder Name</Label>
                  <Input
                    id="cardHolder"
                    placeholder="John Doe"
                    value={form.cardHolder}
                    onChange={(e) => setForm(prev => ({ ...prev, cardHolder: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Select
                      value={form.expiryMonth}
                      onValueChange={(value) => setForm(prev => ({ ...prev, expiryMonth: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year</Label>
                    <Select
                      value={form.expiryYear}
                      onValueChange={(value) => setForm(prev => ({ ...prev, expiryYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={form.cvv}
                        onChange={(e) => setForm(prev => ({ ...prev, cvv: e.target.value }))}
                        className="pl-10"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(violation.fine || 0)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || !form.cardNumber || !form.cardHolder || !form.expiryMonth || !form.expiryYear || !form.cvv}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay {formatCurrency(violation.fine || 0)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This is a demo payment system. No real charges will be made.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
