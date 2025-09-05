"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth);
        if (auth.isAuthenticated && new Date(auth.expiresAt) > new Date()) {
          // Admin is already logged in, redirect to dashboard
          router.push("/admin/dashboard");
        } else {
          // Session expired, clear storage
          localStorage.removeItem("adminAuth");
        }
      } catch {
        // Invalid auth data, clear storage
        localStorage.removeItem("adminAuth");
      }
    }
  }, [router]);

  return <AdminLoginForm />;
}
