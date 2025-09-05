"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";import {
  Shield,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Activity,
} from "lucide-react";
import { adminRoles } from "@/types/violation";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
}

interface AdminNavbarProps {
  admin: AdminUser;
  onLogout: () => void;
}

export function AdminNavbar({ admin, onLogout }: AdminNavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const adminInitials = `${admin.firstName.charAt(0)}${admin.lastName.charAt(
    0
  )}`;
  const roleInfo = adminRoles.find((role) => role.value === admin.role);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Admin Portal
                </h1>
                <p className="text-xs text-muted-foreground">
                  Bike Violation Management
                </p>
              </div>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div
              className={`relative transition-all duration-200 ${
                isSearchFocused ? "transform scale-105" : ""
              }`}
            >
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search violations, users, queries..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side - Actions and User menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Activity Monitor */}
            <Button variant="ghost" size="sm" className="relative">
              <Activity className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 px-3 py-2 h-auto"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm font-semibold">
                      {adminInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          roleInfo?.color || "bg-secondary text-secondary-foreground"
                        }
                        variant="outline"
                      >
                        {roleInfo?.label || admin.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {admin.department.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                          {adminInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {admin.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          roleInfo?.color || "bg-gray-100 text-gray-800"
                        }
                      >
                        {roleInfo?.label || admin.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {admin.department.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Admin Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/activity" className="flex items-center">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Activity Log</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
