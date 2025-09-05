"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { type AdminUser } from "@/types/violation";

export function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Admin credentials come from environment for dynamic control
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin12345";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call the admin authentication API
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed. Please try again.");
        return;
      }

      // Store admin session
      const adminAuth = {
        isAuthenticated: true,
        admin: data.admin,
        token: data.session.token,
        expiresAt: data.session.expiresAt,
      };

      localStorage.setItem("adminAuth", JSON.stringify(adminAuth));

      toast.success(`Welcome back, ${data.admin.firstName}!`);

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (adminEmail: string) => {
    setFormData({
      email: adminEmail,
      password: "demo123",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-900/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Bike Violation Management System</p>
        </div>

        {/* Login Form */}
        <Card className="bg-card/80 backdrop-blur-lg border-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Administrator Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@bikeviolation.gov"
                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In to Admin Portal
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Demo Accounts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin@bikeviolation.gov")}
                className="w-full justify-start text-left bg-background border-border text-foreground hover:bg-accent"
              >
                <div>
                  <div className="font-medium">Super Admin</div>
                  <div className="text-xs text-muted-foreground">
                    admin@bikeviolation.gov
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("support@bikeviolation.gov")}
                className="w-full justify-start text-left bg-background border-border text-foreground hover:bg-accent"
              >
                <div>
                  <div className="font-medium">Support Agent</div>
                  <div className="text-xs text-muted-foreground">
                    support@bikeviolation.gov
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("enforcement@bikeviolation.gov")}
                className="w-full justify-start text-left bg-background border-border text-foreground hover:bg-accent"
              >
                <div>
                  <div className="font-medium">Enforcement Officer</div>
                  <div className="text-xs text-muted-foreground">
                    enforcement@bikeviolation.gov
                  </div>
                </div>
              </Button>
            </div>

            <Separator className="bg-border" />

            <p className="text-xs text-muted-foreground text-center">
              Click any demo account above to auto-fill credentials
            </p>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a secure admin portal. All activities are logged and
            monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
