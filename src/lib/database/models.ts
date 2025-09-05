// Database Models for Bike Violation Management System

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  numberPlate?: string;
  role: "user" | "admin" | "super_admin";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastLogin?: string;
  profilePicture?: string;
  phoneNumber?: string;
  address?: string;
}

export interface Case {
  id: string;
  userId: string; // Foreign key to User
  violationType:
    | "speeding"
    | "parking"
    | "traffic_light"
    | "no_helmet"
    | "wrong_lane"
    | "mobile_use"
    | "other";
  violation: string; // Description of the violation
  fine: number; // Fine amount in currency
  proofUrl: string; // URL to proof image/video
  location: string;
  date: string; // ISO date string when violation occurred
  status: "pending" | "paid" | "disputed" | "resolved" | "cancelled";
  createdAt: string;
  updatedAt: string;
  dueDate: string; // Payment due date
  paidAt?: string;
  disputedAt?: string;
  resolvedAt?: string;
  adminNotes?: string;
  evidenceUrls?: string[]; // Additional evidence
  officerId?: string; // ID of the issuing officer
  vehicleDetails?: {
    make: string;
    model: string;
    color: string;
    year: number;
  };
}

export interface Query {
  id: string;
  userId: string; // Foreign key to User
  caseId?: string; // Optional foreign key to Case if query is about specific case
  subject: string;
  message: string;
  category:
    | "violation_dispute"
    | "payment_issues"
    | "technical_support"
    | "general_inquiry";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  date: string; // ISO date string when query was created
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Admin ID
  resolvedAt?: string;
  responses: QueryResponse[];
  attachments?: QueryAttachment[];
  tags?: string[];
  isUrgent: boolean;
  lastResponseAt?: string;
}

export interface QueryResponse {
  id: string;
  queryId: string; // Foreign key to Query
  message: string;
  respondedBy: string; // User ID or Admin ID
  respondedAt: string;
  isFromAdmin: boolean;
  template?: string; // Template used for response
  priority?: "low" | "medium" | "high";
  attachments?: QueryAttachment[];
  internalNotes?: string; // Admin-only notes
  editedAt?: string;
  isEdited: boolean;
}

export interface QueryAttachment {
  id: string;
  queryId?: string; // Foreign key to Query
  responseId?: string; // Foreign key to QueryResponse
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string; // User ID
  isPublic: boolean;
}

// Database schema for relationships
export interface DatabaseSchema {
  users: User[];
  cases: Case[];
  queries: Query[];
  queryResponses: QueryResponse[];
  queryAttachments: QueryAttachment[];
}

// Type definitions for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search interfaces
export interface UserFilters {
  role?: User["role"];
  isActive?: boolean;
  search?: string; // Search by name, email, or number plate
  createdAfter?: string;
  createdBefore?: string;
}

export interface CaseFilters {
  userId?: string;
  violationType?: Case["violationType"];
  status?: Case["status"];
  minFine?: number;
  maxFine?: number;
  dateFrom?: string;
  dateTo?: string;
  isPaid?: boolean;
  isDisputed?: boolean;
}

export interface QueryFilters {
  userId?: string;
  category?: Query["category"];
  status?: Query["status"];
  priority?: Query["priority"];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  isUrgent?: boolean;
  hasAttachments?: boolean;
}

// Database operations interfaces
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  numberPlate?: string;
  role?: User["role"];
  phoneNumber?: string;
  address?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  numberPlate?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
}

export interface CreateCaseRequest {
  userId: string;
  violationType: Case["violationType"];
  violation: string;
  fine: number;
  proofUrl: string;
  location: string;
  date: string;
  dueDate: string;
  officerId?: string;
  vehicleDetails?: Case["vehicleDetails"];
  evidenceUrls?: string[];
}

export interface UpdateCaseRequest {
  violationType?: Case["violationType"];
  violation?: string;
  fine?: number;
  location?: string;
  status?: Case["status"];
  adminNotes?: string;
  evidenceUrls?: string[];
}

export interface CreateQueryRequest {
  userId: string;
  caseId?: string;
  subject: string;
  message: string;
  category: Query["category"];
  priority?: Query["priority"];
  attachments?: File[];
  isUrgent?: boolean;
}

export interface CreateQueryResponseRequest {
  queryId: string;
  message: string;
  isFromAdmin: boolean;
  template?: string;
  priority?: QueryResponse["priority"];
  attachments?: File[];
  internalNotes?: string;
  markAsResolved?: boolean;
}

// Validation schemas (for runtime validation)
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Statistics interfaces
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<User["role"], number>;
}

export interface CaseStats {
  totalCases: number;
  pendingCases: number;
  paidCases: number;
  disputedCases: number;
  totalFines: number;
  collectedFines: number;
  casesByType: Record<Case["violationType"], number>;
  casesByMonth: Record<string, number>;
}

export interface QueryStats {
  totalQueries: number;
  openQueries: number;
  resolvedQueries: number;
  averageResponseTime: number; // in hours
  queriesByCategory: Record<Query["category"], number>;
  queriesByPriority: Record<Query["priority"], number>;
}
