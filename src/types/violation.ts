export interface Evidence {
  id: string;
  type: "image" | "video";
  url: string;
  filename: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  thumbnail?: string;
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "bank_transfer" | "digital_wallet";
  provider:
    | "visa"
    | "mastercard"
    | "amex"
    | "discover"
    | "paypal"
    | "apple_pay"
    | "google_pay"
    | "bank";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  isDefault?: boolean;
}

export interface PaymentTransaction {
  id: string;
  violationId: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  method: PaymentMethod;
  transactionId?: string;
  processingFee?: number;
  netAmount?: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  receipt?: {
    url: string;
    downloadUrl: string;
  };
  refund?: {
    id: string;
    amount: number;
    reason: string;
    processedAt: string;
  };
}

export interface Violation {
  id: string;
  caseNumber: string;
  type:
    | "parking"
    | "speeding"
    | "wrong_lane"
    | "no_helmet"
    | "signal_violation"
    | "other";
  description: string;
  location: string;
  date: string;
  time: string;
  status: "pending" | "under_review" | "resolved" | "dismissed" | "appealed";
  priority: "low" | "medium" | "high";
  reportedBy: string;
  officerId?: string;
  fine?: number;
  dueDate?: string;
  evidence?: Evidence[];
  notes?: string;
  payment?: PaymentTransaction;
  paymentStatus?: "unpaid" | "paid" | "overdue" | "refunded" | "disputed";
  createdAt: string;
  updatedAt: string;
}

export interface ViolationFilters {
  status?: string;
  type?: string;
  priority?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const violationTypes = [
  { value: "parking", label: "Illegal Parking" },
  { value: "speeding", label: "Speeding" },
  { value: "wrong_lane", label: "Wrong Lane" },
  { value: "no_helmet", label: "No Helmet" },
  { value: "signal_violation", label: "Signal Violation" },
  { value: "other", label: "Other" },
];

export const violationStatuses = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "under_review",
    label: "Under Review",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "resolved",
    label: "Resolved",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "dismissed",
    label: "Dismissed",
    color: "bg-gray-100 text-gray-800",
  },
  {
    value: "appealed",
    label: "Appealed",
    color: "bg-purple-100 text-purple-800",
  },
];

export const violationPriorities = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" },
];

// Mock data generator
export function generateMockViolations(
  userId: string,
  count: number = 10
): Violation[] {
  const violations: Violation[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(
      now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000
    ); // Last 90 days
    const caseNumber = `BV-${date.getFullYear()}-${String(
      Math.floor(Math.random() * 10000)
    ).padStart(4, "0")}`;

    const types = violationTypes.map((t) => t.value);
    const statuses = violationStatuses.map((s) => s.value);
    const priorities = violationPriorities.map((p) => p.value);

    const type = types[
      Math.floor(Math.random() * types.length)
    ] as Violation["type"];
    const status = statuses[
      Math.floor(Math.random() * statuses.length)
    ] as Violation["status"];
    const priority = priorities[
      Math.floor(Math.random() * priorities.length)
    ] as Violation["priority"];

    violations.push({
      id: `violation-${i + 1}`,
      caseNumber,
      type,
      description: getDescriptionForType(type),
      location: getRandomLocation(),
      date: date.toISOString().split("T")[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(
        2,
        "0"
      )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      status,
      priority,
      reportedBy: userId,
      officerId: `OFF-${Math.floor(Math.random() * 100)}`,
      fine:
        status === "resolved"
          ? Math.floor(Math.random() * 500) + 50
          : undefined,
      dueDate:
        status === "resolved"
          ? new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : undefined,
      evidence: generateMockEvidence(i + 1),
      notes:
        Math.random() > 0.5
          ? "Additional notes about this violation"
          : undefined,
      createdAt: date.toISOString(),
      updatedAt: new Date(
        date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return violations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getDescriptionForType(type: Violation["type"]): string {
  const descriptions = {
    parking: "Bike parked in no-parking zone",
    speeding: "Exceeding speed limit in residential area",
    wrong_lane: "Riding in wrong direction on bike lane",
    no_helmet: "Riding without proper safety helmet",
    signal_violation: "Failed to stop at red light",
    other: "General traffic violation",
  };
  return descriptions[type];
}

function getRandomLocation(): string {
  const locations = [
    "Main Street & 1st Avenue",
    "Central Park Bike Path",
    "University Campus Area",
    "Downtown Shopping District",
    "Riverside Drive",
    "Business District Plaza",
    "Community Center Parking",
    "School Zone - Oak Street",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateMockEvidence(violationIndex: number): Evidence[] {
  const evidence: Evidence[] = [];
  const evidenceCount = Math.floor(Math.random() * 3) + 1; // 1-3 pieces of evidence

  for (let i = 0; i < evidenceCount; i++) {
    const isVideo = Math.random() > 0.7; // 30% chance of video
    const timestamp = new Date().toISOString();

    evidence.push({
      id: `evidence-${violationIndex}-${i + 1}`,
      type: isVideo ? "video" : "image",
      url: isVideo
        ? `/mock-evidence/violation-${violationIndex}-video-${i + 1}.mp4`
        : `/mock-evidence/violation-${violationIndex}-photo-${i + 1}.jpg`,
      filename: isVideo
        ? `violation_${violationIndex}_video_${i + 1}.mp4`
        : `violation_${violationIndex}_photo_${i + 1}.jpg`,
      fileSize: isVideo
        ? Math.floor(Math.random() * 50000000) + 10000000 // 10-60MB for videos
        : Math.floor(Math.random() * 5000000) + 500000, // 0.5-5.5MB for images
      uploadedBy: `Officer-${Math.floor(Math.random() * 100)}`,
      uploadedAt: timestamp,
      description: getEvidenceDescription(isVideo, i),
      thumbnail: isVideo
        ? `/mock-evidence/violation-${violationIndex}-video-${i + 1}-thumb.jpg`
        : undefined,
    });
  }

  return evidence;
}

function getEvidenceDescription(isVideo: boolean, index: number): string {
  const descriptions = {
    image: [
      "Photo of violation from street camera",
      "Close-up shot of license plate",
      "Wide angle view of violation scene",
      "Evidence photo taken by officer",
    ],
    video: [
      "Security camera footage of violation",
      "Dashcam recording of incident",
      "Officer body camera footage",
      "Traffic camera video evidence",
    ],
  };

  const options = isVideo ? descriptions.video : descriptions.image;
  return options[index % options.length];
}

// Query/Contact Types
export interface QueryAttachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface AdminQuery {
  id: string;
  subject: string;
  message: string;
  category:
    | "general"
    | "violation_dispute"
    | "payment_issue"
    | "technical_support"
    | "account_help"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "pending_user" | "resolved" | "closed";
  userId: string;
  userEmail: string;
  userName: string;
  relatedViolationId?: string;
  attachments?: QueryAttachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminResponse?: {
    message: string;
    respondedBy: string;
    respondedAt: string;
  }[];
}

export const queryCategories = [
  {
    value: "general",
    label: "General Inquiry",
    description: "General questions or concerns",
  },
  {
    value: "violation_dispute",
    label: "Violation Dispute",
    description: "Dispute a traffic violation",
  },
  {
    value: "payment_issue",
    label: "Payment Issue",
    description: "Problems with payments or billing",
  },
  {
    value: "technical_support",
    label: "Technical Support",
    description: "Website or app technical issues",
  },
  {
    value: "account_help",
    label: "Account Help",
    description: "Account access or profile issues",
  },
  {
    value: "other",
    label: "Other",
    description: "Other inquiries not listed above",
  },
];

export const queryPriorities = [
  {
    value: "low",
    label: "Low",
    color: "bg-green-100 text-green-800",
    description: "General questions",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
    description: "Standard issues",
  },
  {
    value: "high",
    label: "High",
    color: "bg-orange-100 text-orange-800",
    description: "Important matters",
  },
  {
    value: "urgent",
    label: "Urgent",
    color: "bg-red-100 text-red-800",
    description: "Critical issues requiring immediate attention",
  },
];

export const queryStatuses = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "pending_user",
    label: "Pending User",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "resolved",
    label: "Resolved",
    color: "bg-green-100 text-green-800",
  },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  password: string; // Added password field for authentication
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "moderator" | "support";
  department: "enforcement" | "tech_support" | "finance" | "management";
  permissions: AdminPermission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  resource:
    | "violations"
    | "users"
    | "payments"
    | "queries"
    | "reports"
    | "settings";
  actions: ("view" | "create" | "edit" | "delete" | "approve")[];
}

export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const adminRoles = [
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Full system access and management",
    color: "bg-red-100 text-red-800",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Administrative access to most features",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "moderator",
    label: "Moderator",
    description: "Content moderation and user management",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "support",
    label: "Support",
    description: "User support and query management",
    color: "bg-green-100 text-green-800",
  },
];

export const adminDepartments = [
  {
    value: "enforcement",
    label: "Enforcement",
    description: "Traffic violation enforcement",
  },
  {
    value: "tech_support",
    label: "Technical Support",
    description: "System and user technical support",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Payment and billing management",
  },
  {
    value: "management",
    label: "Management",
    description: "Overall system management",
  },
];
