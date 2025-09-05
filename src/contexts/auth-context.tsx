"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name?: string; // full name as stored in DB
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const authData = localStorage.getItem("auth");
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        if (auth.isAuthenticated && auth.user) {
          // Normalize user shape: ensure firstName/lastName are present
          const raw = auth.user as Partial<User>;
          const name = raw.name || `${raw.firstName || ""} ${raw.lastName || ""}`.trim();
          const [firstName, ...rest] = (name || "").split(" ");
          const lastName = rest.join(" ");
          setUser({
            id: raw.id as string,
            email: raw.email as string,
            name: name || undefined,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          });
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        localStorage.removeItem("auth");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: Partial<User>) => {
    const name = userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    const [firstName, ...rest] = (name || "").split(" ");
    const lastName = rest.join(" ");
    const normalized: User = {
      id: userData.id as string,
      email: userData.email as string,
      name: name || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    };
    const authData = {
      isAuthenticated: true,
      user: normalized,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("auth", JSON.stringify(authData));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
