import {
  User,
  Case,
  Query,
  QueryResponse,
  DatabaseSchema,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCaseRequest,
  UpdateCaseRequest,
  CreateQueryRequest,
  CreateQueryResponseRequest,
  UserFilters,
  CaseFilters,
  QueryFilters,
  PaginatedResponse,
  UserStats,
  CaseStats,
  QueryStats,
  ValidationResult,
} from "./models";

// In-memory database simulation (in production, replace with actual database)
class DatabaseService {
  private data: DatabaseSchema = {
    users: [],
    cases: [],
    queries: [],
    queryResponses: [],
    queryAttachments: [],
  };

  // Initialize with sample data
  constructor() {
    this.initializeSampleData();
  }

  // User Operations
  async createUser(userData: CreateUserRequest): Promise<User> {
    const validation = this.validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Check if email or number plate already exists
    const existingUser = this.data.users.find(
      (u) =>
        u.email === userData.email || u.numberPlate === userData.numberPlate
    );
    if (existingUser) {
      throw new Error("User with this email or number plate already exists");
    }

    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      password: userData.password, // In production, hash this
  numberPlate: userData.numberPlate ? userData.numberPlate.toUpperCase() : undefined,
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
    };

    this.data.users.push(user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find((u) => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.data.users.find((u) => u.email === email) || null;
  }

  async getUserByNumberPlate(numberPlate: string): Promise<User | null> {
    return (
      this.data.users.find(
        (u) => u.numberPlate === numberPlate.toUpperCase()
      ) || null
    );
  }

  async updateUser(
    id: string,
    updates: UpdateUserRequest
  ): Promise<User | null> {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    const user = this.data.users[userIndex];
    this.data.users[userIndex] = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.data.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return false;

    this.data.users.splice(userIndex, 1);
    return true;
  }

  async getUsers(
    filters?: UserFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<User>> {
    let filteredUsers = [...this.data.users];

    if (filters) {
      if (filters.role) {
        filteredUsers = filteredUsers.filter((u) => u.role === filters.role);
      }
      if (filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(
          (u) => u.isActive === filters.isActive
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            (u.numberPlate && u.numberPlate.toLowerCase().includes(search))
        );
      }
      if (filters.createdAfter) {
        filteredUsers = filteredUsers.filter(
          (u) => u.createdAt >= filters.createdAfter!
        );
      }
      if (filters.createdBefore) {
        filteredUsers = filteredUsers.filter(
          (u) => u.createdAt <= filters.createdBefore!
        );
      }
    }

    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredUsers.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Case Operations
  async createCase(caseData: CreateCaseRequest): Promise<Case> {
    const validation = this.validateCase(caseData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const caseRecord: Case = {
      id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: caseData.userId,
      violationType: caseData.violationType,
      violation: caseData.violation,
      fine: caseData.fine,
      proofUrl: caseData.proofUrl,
      location: caseData.location,
      date: caseData.date,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: caseData.dueDate,
      officerId: caseData.officerId,
      vehicleDetails: caseData.vehicleDetails,
      evidenceUrls: caseData.evidenceUrls || [],
    };

    this.data.cases.push(caseRecord);
    return caseRecord;
  }

  async getCaseById(id: string): Promise<Case | null> {
    return this.data.cases.find((c) => c.id === id) || null;
  }

  async getCasesByUserId(userId: string): Promise<Case[]> {
    return this.data.cases.filter((c) => c.userId === userId);
  }

  async updateCase(
    id: string,
    updates: UpdateCaseRequest
  ): Promise<Case | null> {
    const caseIndex = this.data.cases.findIndex((c) => c.id === id);
    if (caseIndex === -1) return null;

    const caseRecord = this.data.cases[caseIndex];
    this.data.cases[caseIndex] = {
      ...caseRecord,
      ...updates,
      updatedAt: new Date().toISOString(),
      paidAt:
        updates.status === "paid"
          ? new Date().toISOString()
          : caseRecord.paidAt,
      disputedAt:
        updates.status === "disputed"
          ? new Date().toISOString()
          : caseRecord.disputedAt,
      resolvedAt:
        updates.status === "resolved"
          ? new Date().toISOString()
          : caseRecord.resolvedAt,
    };

    return this.data.cases[caseIndex];
  }

  async deleteCase(id: string): Promise<boolean> {
    const caseIndex = this.data.cases.findIndex((c) => c.id === id);
    if (caseIndex === -1) return false;

    this.data.cases.splice(caseIndex, 1);
    return true;
  }

  async getCases(
    filters?: CaseFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Case>> {
    let filteredCases = [...this.data.cases];

    if (filters) {
      if (filters.userId) {
        filteredCases = filteredCases.filter(
          (c) => c.userId === filters.userId
        );
      }
      if (filters.violationType) {
        filteredCases = filteredCases.filter(
          (c) => c.violationType === filters.violationType
        );
      }
      if (filters.status) {
        filteredCases = filteredCases.filter(
          (c) => c.status === filters.status
        );
      }
      if (filters.minFine) {
        filteredCases = filteredCases.filter((c) => c.fine >= filters.minFine!);
      }
      if (filters.maxFine) {
        filteredCases = filteredCases.filter((c) => c.fine <= filters.maxFine!);
      }
      if (filters.dateFrom) {
        filteredCases = filteredCases.filter(
          (c) => c.date >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        filteredCases = filteredCases.filter((c) => c.date <= filters.dateTo!);
      }
      if (filters.isPaid !== undefined) {
        filteredCases = filteredCases.filter(
          (c) => (c.status === "paid") === filters.isPaid
        );
      }
      if (filters.isDisputed !== undefined) {
        filteredCases = filteredCases.filter(
          (c) => (c.status === "disputed") === filters.isDisputed
        );
      }
    }

    const total = filteredCases.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredCases.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Query Operations
  async createQuery(queryData: CreateQueryRequest): Promise<Query> {
    const validation = this.validateQuery(queryData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const query: Query = {
      id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: queryData.userId,
      caseId: queryData.caseId,
      subject: queryData.subject,
      message: queryData.message,
      category: queryData.category,
      priority: queryData.priority || "medium",
      status: "open",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      attachments: [],
      tags: [],
      isUrgent: queryData.isUrgent || false,
    };

    this.data.queries.push(query);
    return query;
  }

  async getQueryById(id: string): Promise<Query | null> {
    const query = this.data.queries.find((q) => q.id === id);
    if (!query) return null;

    // Include responses
    query.responses = this.data.queryResponses.filter((r) => r.queryId === id);
    query.attachments = this.data.queryAttachments.filter(
      (a) => a.queryId === id
    );

    return query;
  }

  async getQueriesByUserId(userId: string): Promise<Query[]> {
    return this.data.queries
      .filter((q) => q.userId === userId)
      .map((q) => ({
        ...q,
        responses: this.data.queryResponses.filter((r) => r.queryId === q.id),
        attachments: this.data.queryAttachments.filter(
          (a) => a.queryId === q.id
        ),
      }));
  }

  async updateQuery(
    id: string,
    updates: Partial<Query>
  ): Promise<Query | null> {
    const queryIndex = this.data.queries.findIndex((q) => q.id === id);
    if (queryIndex === -1) return null;

    const query = this.data.queries[queryIndex];
    this.data.queries[queryIndex] = {
      ...query,
      ...updates,
      updatedAt: new Date().toISOString(),
      resolvedAt:
        updates.status === "resolved"
          ? new Date().toISOString()
          : query.resolvedAt,
    };

    return this.data.queries[queryIndex];
  }

  async deleteQuery(id: string): Promise<boolean> {
    const queryIndex = this.data.queries.findIndex((q) => q.id === id);
    if (queryIndex === -1) return false;

    // Delete related responses and attachments
    this.data.queryResponses = this.data.queryResponses.filter(
      (r) => r.queryId !== id
    );
    this.data.queryAttachments = this.data.queryAttachments.filter(
      (a) => a.queryId !== id
    );
    this.data.queries.splice(queryIndex, 1);
    return true;
  }

  async getQueries(
    filters?: QueryFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Query>> {
    let filteredQueries = [...this.data.queries];

    if (filters) {
      if (filters.userId) {
        filteredQueries = filteredQueries.filter(
          (q) => q.userId === filters.userId
        );
      }
      if (filters.category) {
        filteredQueries = filteredQueries.filter(
          (q) => q.category === filters.category
        );
      }
      if (filters.status) {
        filteredQueries = filteredQueries.filter(
          (q) => q.status === filters.status
        );
      }
      if (filters.priority) {
        filteredQueries = filteredQueries.filter(
          (q) => q.priority === filters.priority
        );
      }
      if (filters.assignedTo) {
        filteredQueries = filteredQueries.filter(
          (q) => q.assignedTo === filters.assignedTo
        );
      }
      if (filters.dateFrom) {
        filteredQueries = filteredQueries.filter(
          (q) => q.date >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        filteredQueries = filteredQueries.filter(
          (q) => q.date <= filters.dateTo!
        );
      }
      if (filters.isUrgent !== undefined) {
        filteredQueries = filteredQueries.filter(
          (q) => q.isUrgent === filters.isUrgent
        );
      }
      if (filters.hasAttachments !== undefined) {
        filteredQueries = filteredQueries.filter(
          (q) =>
            (q.attachments && q.attachments.length > 0) ===
            filters.hasAttachments
        );
      }
    }

    // Include responses and attachments for each query
    const queriesWithRelations = filteredQueries.map((q) => ({
      ...q,
      responses: this.data.queryResponses.filter((r) => r.queryId === q.id),
      attachments: this.data.queryAttachments.filter((a) => a.queryId === q.id),
    }));

    const total = queriesWithRelations.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = queriesWithRelations.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Query Response Operations
  async createQueryResponse(
    responseData: CreateQueryResponseRequest
  ): Promise<QueryResponse> {
    const response: QueryResponse = {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      queryId: responseData.queryId,
      message: responseData.message,
      respondedBy: "current-user", // In production, get from auth context
      respondedAt: new Date().toISOString(),
      isFromAdmin: responseData.isFromAdmin,
      template: responseData.template,
      priority: responseData.priority,
      internalNotes: responseData.internalNotes,
      isEdited: false,
    };

    this.data.queryResponses.push(response);

    // Update query status and last response time
    const queryIndex = this.data.queries.findIndex(
      (q) => q.id === responseData.queryId
    );
    if (queryIndex !== -1) {
      this.data.queries[queryIndex] = {
        ...this.data.queries[queryIndex],
        status: responseData.markAsResolved ? "resolved" : "in_progress",
        lastResponseAt: response.respondedAt,
        updatedAt: new Date().toISOString(),
      };
    }

    return response;
  }

  // Statistics Operations
  async getUserStats(): Promise<UserStats> {
    const users = this.data.users;
    const now = new Date();
    const thisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      newUsersThisMonth: users.filter((u) => u.createdAt >= thisMonth).length,
      usersByRole: {
        user: users.filter((u) => u.role === "user").length,
        admin: users.filter((u) => u.role === "admin").length,
        super_admin: users.filter((u) => u.role === "super_admin").length,
      },
    };
  }

  async getCaseStats(): Promise<CaseStats> {
    const cases = this.data.cases;

    return {
      totalCases: cases.length,
      pendingCases: cases.filter((c) => c.status === "pending").length,
      paidCases: cases.filter((c) => c.status === "paid").length,
      disputedCases: cases.filter((c) => c.status === "disputed").length,
      totalFines: cases.reduce((sum, c) => sum + c.fine, 0),
      collectedFines: cases
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.fine, 0),
      casesByType: {
        speeding: cases.filter((c) => c.violationType === "speeding").length,
        parking: cases.filter((c) => c.violationType === "parking").length,
        traffic_light: cases.filter((c) => c.violationType === "traffic_light")
          .length,
        no_helmet: cases.filter((c) => c.violationType === "no_helmet").length,
        wrong_lane: cases.filter((c) => c.violationType === "wrong_lane")
          .length,
        mobile_use: cases.filter((c) => c.violationType === "mobile_use")
          .length,
        other: cases.filter((c) => c.violationType === "other").length,
      },
      casesByMonth: this.getCasesByMonth(cases),
    };
  }

  async getQueryStats(): Promise<QueryStats> {
    const queries = this.data.queries;
  // Calculate average response time
    const resolvedQueries = queries.filter((q) => q.status === "resolved");
    const totalResponseTime = resolvedQueries.reduce((sum, q) => {
      if (q.resolvedAt) {
        const created = new Date(q.createdAt).getTime();
        const resolved = new Date(q.resolvedAt).getTime();
        return sum + (resolved - created);
      }
      return sum;
    }, 0);

    const averageResponseTime =
      resolvedQueries.length > 0
        ? totalResponseTime / resolvedQueries.length / (1000 * 60 * 60) // Convert to hours
        : 0;

    return {
      totalQueries: queries.length,
      openQueries: queries.filter((q) => q.status === "open").length,
      resolvedQueries: queries.filter((q) => q.status === "resolved").length,
      averageResponseTime,
      queriesByCategory: {
        violation_dispute: queries.filter(
          (q) => q.category === "violation_dispute"
        ).length,
        payment_issues: queries.filter((q) => q.category === "payment_issues")
          .length,
        technical_support: queries.filter(
          (q) => q.category === "technical_support"
        ).length,
        general_inquiry: queries.filter((q) => q.category === "general_inquiry")
          .length,
      },
      queriesByPriority: {
        low: queries.filter((q) => q.priority === "low").length,
        medium: queries.filter((q) => q.priority === "medium").length,
        high: queries.filter((q) => q.priority === "high").length,
      },
    };
  }

  // Validation Methods
  private validateUser(userData: CreateUserRequest): ValidationResult {
    const errors: string[] = [];

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push("Valid email is required");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (
      !userData.numberPlate ||
      !this.isValidNumberPlate(userData.numberPlate)
    ) {
      errors.push("Valid number plate is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateCase(caseData: CreateCaseRequest): ValidationResult {
    const errors: string[] = [];

    if (!caseData.violation || caseData.violation.trim().length < 5) {
      errors.push("Violation description must be at least 5 characters long");
    }

    if (!caseData.fine || caseData.fine <= 0) {
      errors.push("Fine amount must be greater than 0");
    }

    if (!caseData.proofUrl) {
      errors.push("Proof URL is required");
    }

    if (!caseData.location || caseData.location.trim().length < 3) {
      errors.push("Location must be at least 3 characters long");
    }

    if (!caseData.date || !this.isValidDate(caseData.date)) {
      errors.push("Valid date is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateQuery(queryData: CreateQueryRequest): ValidationResult {
    const errors: string[] = [];

    if (!queryData.subject || queryData.subject.trim().length < 5) {
      errors.push("Subject must be at least 5 characters long");
    }

    if (!queryData.message || queryData.message.trim().length < 10) {
      errors.push("Message must be at least 10 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Utility Methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidNumberPlate(numberPlate: string): boolean {
    // Basic validation for number plate format
    const plateRegex = /^[A-Z0-9]{3,8}$/i;
    return plateRegex.test(numberPlate);
  }

  private isValidDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  private getCasesByMonth(cases: Case[]): Record<string, number> {
    const casesByMonth: Record<string, number> = {};

    cases.forEach((caseRecord) => {
      const date = new Date(caseRecord.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      casesByMonth[monthKey] = (casesByMonth[monthKey] || 0) + 1;
    });

    return casesByMonth;
  }

  // Initialize with sample data
  private initializeSampleData(): void {
    // Sample users
    const sampleUsers: User[] = [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        numberPlate: "ABC123",
        role: "user",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        isActive: true,
        phoneNumber: "+1234567890",
        address: "123 Main St, City",
      },
      {
        id: "admin-1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        numberPlate: "ADMIN01",
        role: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        isActive: true,
      },
    ];

    // Sample cases
    const sampleCases: Case[] = [
      {
        id: "case-1",
        userId: "user-1",
        violationType: "speeding",
        violation: "Exceeding speed limit by 20 km/h",
        fine: 150,
        proofUrl: "/images/proof1.jpg",
        location: "Main Street intersection",
        date: "2024-02-01T14:30:00Z",
        status: "pending",
        createdAt: "2024-02-01T15:00:00Z",
        updatedAt: "2024-02-01T15:00:00Z",
        dueDate: "2024-03-01T23:59:59Z",
        officerId: "officer-1",
      },
    ];

    // Sample queries
    const sampleQueries: Query[] = [
      {
        id: "query-1",
        userId: "user-1",
        caseId: "case-1",
        subject: "Dispute speeding violation",
        message: "I believe this violation was issued in error...",
        category: "violation_dispute",
        priority: "medium",
        status: "open",
        date: "2024-02-05T10:00:00Z",
        createdAt: "2024-02-05T10:00:00Z",
        updatedAt: "2024-02-05T10:00:00Z",
        responses: [],
        attachments: [],
        tags: ["dispute", "speeding"],
        isUrgent: false,
      },
    ];

    this.data.users = sampleUsers;
    this.data.cases = sampleCases;
    this.data.queries = sampleQueries;
  }

  // Export data (for backup/migration)
  exportData(): DatabaseSchema {
    return { ...this.data };
  }

  // Import data (for restore/migration)
  importData(data: DatabaseSchema): void {
    this.data = { ...data };
  }
}

// Singleton instance
export const db = new DatabaseService();
export default db;
