import { useState, useEffect } from "react";
import {
  User,
  Case,
  Query,
  UserFilters,
  CaseFilters,
  QueryFilters,
  PaginatedResponse,
  UserStats,
  CaseStats,
  QueryStats,
  CreateUserRequest,
  CreateCaseRequest,
  CreateQueryRequest,
  UpdateUserRequest,
  UpdateCaseRequest,
} from "@/lib/database/models";

// Custom hook for API calls
function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API call failed");
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
}

// Users hooks
export function useUsers(filters?: UserFilters, page = 1, limit = 10) {
  const [users, setUsers] = useState<PaginatedResponse<
    Omit<User, "password">
  > | null>(null);
  const { apiCall, loading, error } = useApi();

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.append(k, String(v));
        });
      }

      const data = await apiCall<PaginatedResponse<Omit<User, "password">>>(
        `/api/users?${params.toString()}`
      );
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, page, limit]);

  const createUser = async (userData: CreateUserRequest) => {
    const data = await apiCall<Omit<User, "password">>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    await fetchUsers(); // Refresh list
    return data;
  };

  const updateUser = async (id: string, updates: UpdateUserRequest) => {
    const data = await apiCall<Omit<User, "password">>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await fetchUsers(); // Refresh list
    return data;
  };

  const deleteUser = async (id: string) => {
    await apiCall(`/api/users/${id}`, { method: "DELETE" });
    await fetchUsers(); // Refresh list
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refresh: fetchUsers,
  };
}

export function useUser(id: string) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    if (id) {
      apiCall<Omit<User, "password">>(`/api/users/${id}`)
        .then(setUser)
        .catch(console.error);
    }
  }, [id]);

  return { user, loading, error };
}

// Cases hooks
export function useCases(filters?: CaseFilters, page = 1, limit = 10) {
  const [cases, setCases] = useState<PaginatedResponse<Case> | null>(null);
  const { apiCall, loading, error } = useApi();

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.append(k, String(v));
        });
      }

      const data = await apiCall<PaginatedResponse<Case>>(
        `/api/cases?${params.toString()}`
      );
      setCases(data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filters, page, limit]);

  const createCase = async (caseData: CreateCaseRequest) => {
    const data = await apiCall<Case>("/api/cases", {
      method: "POST",
      body: JSON.stringify(caseData),
    });
    await fetchCases(); // Refresh list
    return data;
  };

  const updateCase = async (id: string, updates: UpdateCaseRequest) => {
    const data = await apiCall<Case>(`/api/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await fetchCases(); // Refresh list
    return data;
  };

  const deleteCase = async (id: string) => {
    await apiCall(`/api/cases/${id}`, { method: "DELETE" });
    await fetchCases(); // Refresh list
  };

  return {
    cases,
    loading,
    error,
    createCase,
    updateCase,
    deleteCase,
    refresh: fetchCases,
  };
}

export function useCase(id: string) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    if (id) {
      apiCall<Case>(`/api/cases/${id}`).then(setCaseData).catch(console.error);
    }
  }, [id]);

  return { case: caseData, loading, error };
}

// Queries hooks
export function useQueries(filters?: QueryFilters, page = 1, limit = 10) {
  const [queries, setQueries] = useState<PaginatedResponse<Query> | null>(null);
  const { apiCall, loading, error } = useApi();

  const fetchQueries = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.append(k, String(v));
        });
      }

      const data = await apiCall<PaginatedResponse<Query>>(
        `/api/queries?${params.toString()}`
      );
      setQueries(data);
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [filters, page, limit]);

  const createQuery = async (queryData: CreateQueryRequest) => {
    const data = await apiCall<Query>("/api/queries", {
      method: "POST",
      body: JSON.stringify(queryData),
    });
    await fetchQueries(); // Refresh list
    return data;
  };

  return {
    queries,
    loading,
    error,
    createQuery,
    refresh: fetchQueries,
  };
}

export function useQuery(id: string) {
  const [query, setQuery] = useState<Query | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    if (id) {
      apiCall<Query>(`/api/queries/${id}`).then(setQuery).catch(console.error);
    }
  }, [id]);

  return { query, loading, error };
}

// Statistics hooks
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    apiCall<UserStats>("/api/stats?type=users")
      .then(setStats)
      .catch(console.error);
  }, []);

  return { stats, loading, error };
}

export function useCaseStats() {
  const [stats, setStats] = useState<CaseStats | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    apiCall<CaseStats>("/api/stats?type=cases")
      .then(setStats)
      .catch(console.error);
  }, []);

  return { stats, loading, error };
}

export function useQueryStats() {
  const [stats, setStats] = useState<QueryStats | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    apiCall<QueryStats>("/api/stats?type=queries")
      .then(setStats)
      .catch(console.error);
  }, []);

  return { stats, loading, error };
}

export function useAllStats() {
  const [stats, setStats] = useState<{
    users: UserStats;
    cases: CaseStats;
    queries: QueryStats;
  } | null>(null);
  const { apiCall, loading, error } = useApi();

  useEffect(() => {
    apiCall<{
      users: UserStats;
      cases: CaseStats;
      queries: QueryStats;
    }>("/api/stats?type=all")
      .then(setStats)
      .catch(console.error);
  }, []);

  return { stats, loading, error };
}

// Utility hook for database operations
export function useDatabase() {
  const { apiCall, loading, error } = useApi();

  const searchUsers = async (searchTerm: string) => {
    return apiCall<PaginatedResponse<Omit<User, "password">>>(
      `/api/users?search=${encodeURIComponent(searchTerm)}`
    );
  };

  const getUserByEmail = async (email: string) => {
    const users = await apiCall<PaginatedResponse<Omit<User, "password">>>(
      `/api/users?search=${encodeURIComponent(email)}&limit=1`
    );
    return users.data.find((u) => u.email === email) || null;
  };

  const getCasesByUser = async (userId: string) => {
    return apiCall<PaginatedResponse<Case>>(`/api/cases?userId=${userId}`);
  };

  const getQueriesByUser = async (userId: string) => {
    return apiCall<PaginatedResponse<Query>>(`/api/queries?userId=${userId}`);
  };

  const getOpenQueries = async () => {
    return apiCall<PaginatedResponse<Query>>("/api/queries?status=open");
  };

  const getHighPriorityQueries = async () => {
    return apiCall<PaginatedResponse<Query>>("/api/queries?priority=high");
  };

  const getPendingCases = async () => {
    return apiCall<PaginatedResponse<Case>>("/api/cases?status=pending");
  };

  const getDisputedCases = async () => {
    return apiCall<PaginatedResponse<Case>>("/api/cases?status=disputed");
  };

  return {
    loading,
    error,
    searchUsers,
    getUserByEmail,
    getCasesByUser,
    getQueriesByUser,
    getOpenQueries,
    getHighPriorityQueries,
    getPendingCases,
    getDisputedCases,
  };
}
