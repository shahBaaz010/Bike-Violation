"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const handleLogin = async (loginData: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.error || "Invalid email or password");
        return;
      }
      const user = json.data;
      // Use auth context to normalize and store user state
      try {
        login(user);
  } catch {
        // fallback to localStorage for environments where context isn't available yet
        const authData = { isAuthenticated: true, user, loginTime: new Date().toISOString() };
        localStorage.setItem("auth", JSON.stringify(authData));
      }
      alert("Login successful! Welcome back.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to access the bike violation system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
