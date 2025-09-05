import { getCollection } from "@/lib/database/mongodb";
import type {
  User,
  Case,
  Query,
  QueryResponse,
  QueryAttachment,
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
} from "@/lib/database/models";
import type { PaymentTransaction } from "@/types/violation";
import type { FindCursor, Filter } from "mongodb";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValidNumberPlate(numberPlate: string): boolean {
  const plateRegex = /^[A-Z0-9]{3,8}$/i;
  return plateRegex.test(numberPlate);
}

function isValidDate(date: string): boolean {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

function validateUser(userData: CreateUserRequest): ValidationResult {
  const errors: string[] = [];
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push("Valid email is required");
  }
  if (!userData.password || userData.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  // if (userData.numberPlate && !isValidNumberPlate(userData.numberPlate)) {
  //   errors.push("Valid number plate is required");
  // }
  return { isValid: errors.length === 0, errors };
}

function validateCase(caseData: CreateCaseRequest): ValidationResult {
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
  if (!caseData.date || !isValidDate(caseData.date)) {
    errors.push("Valid date is required");
  }
  return { isValid: errors.length === 0, errors };
}

function validateQuery(queryData: CreateQueryRequest): ValidationResult {
  const errors: string[] = [];
  if (!queryData.subject || queryData.subject.trim().length < 5) {
    errors.push("Subject must be at least 5 characters long");
  }
  if (!queryData.message || queryData.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long");
  }
  return { isValid: errors.length === 0, errors };
}

async function getUsersCollection() {
  return getCollection<User>("users");
}
async function getCasesCollection() {
  return getCollection<Case>("cases");
}
async function getQueriesCollection() {
  return getCollection<Query>("queries");
}
async function getQueryResponsesCollection() {
  return getCollection<QueryResponse>("query_responses");
}
async function getQueryAttachmentsCollection() {
  return getCollection<QueryAttachment>("query_attachments");
}
async function getPaymentsCollection() {
  return getCollection<PaymentTransaction>("payments");
}

async function paginate<T>(
  cursor: FindCursor<T>,
  page: number,
  limit: number,
  countFn: () => Promise<number>
): Promise<PaginatedResponse<T>> {
  const total = await countFn();
  const data: T[] = await cursor.skip((page - 1) * limit).limit(limit).toArray();
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export const db = {
  async createUser(userData: CreateUserRequest): Promise<User> {
    const validation = validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const users = await getUsersCollection();
    const or: Filter<User>[] = [{ email: userData.email }];
    if (userData.numberPlate) {
      or.push({ numberPlate: userData.numberPlate.toUpperCase() } as Filter<User>);
    }
    const existing = await users.findOne({ $or: or } as Filter<User>);
    if (existing) {
      throw new Error("User with this email or number plate already exists");
    }

    const user: User = {
      id: generateId("user"),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      numberPlate: userData.numberPlate?.toUpperCase(),
      role: userData.role || "user",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      isActive: true,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
    };

  await users.insertOne(user);
    return user;
  },

  async getUserById(id: string): Promise<User | null> {
    const users = await getUsersCollection();
    return (await users.findOne({ id })) as User | null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await getUsersCollection();
    return (await users.findOne({ email })) as User | null;
  },

  async getUserByNumberPlate(numberPlate: string): Promise<User | null> {
    const users = await getUsersCollection();
    return (await users.findOne({ numberPlate: numberPlate.toUpperCase() })) as User | null;
  },

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    const users = await getUsersCollection();
    const result = await users.findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: nowIso() } },
      { returnDocument: "after" }
    );
  const wrapped = result as { value?: User | null } | null;
  return wrapped?.value ?? null;
  },

  async deleteUser(id: string): Promise<boolean> {
    const users = await getUsersCollection();
    const res = await users.deleteOne({ id });
    return res.deletedCount === 1;
  },

  async getUsers(
    filters?: UserFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<User>> {
  const users = await getUsersCollection();
  const query: Filter<User> = {} as Filter<User>;
    if (filters) {
      if (filters.role) query.role = filters.role;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.search) {
        const regex = new RegExp(filters.search, "i");
        query.$or = [{ name: regex }, { email: regex }, { numberPlate: regex }];
      }
    if (filters.createdAfter || filters.createdBefore) {
      const createdFilter: Record<string, string> = {};
      if (filters.createdAfter) createdFilter.$gte = filters.createdAfter;
      if (filters.createdBefore) createdFilter.$lte = filters.createdBefore;
      query.createdAt = createdFilter as unknown as Filter<User>["createdAt"];
    }
    }
    const cursor = users.find(query).sort({ createdAt: -1 });
    return paginate<User>(cursor, page, limit, () => users.countDocuments(query));
  },

  async createCase(caseData: CreateCaseRequest): Promise<Case> {
    const validation = validateCase(caseData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    const casesCol = await getCasesCollection();
    const caseRecord: Case = {
      id: generateId("case"),
      userId: caseData.userId,
      violationType: caseData.violationType,
      violation: caseData.violation,
      fine: caseData.fine,
      proofUrl: caseData.proofUrl,
      location: caseData.location,
      date: caseData.date,
      status: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      dueDate: caseData.dueDate,
      officerId: caseData.officerId,
      vehicleDetails: caseData.vehicleDetails,
      evidenceUrls: caseData.evidenceUrls || [],
    };
  await casesCol.insertOne(caseRecord);
    return caseRecord;
  },

  async getCaseById(id: string): Promise<Case | null> {
    const casesCol = await getCasesCollection();
  return (await casesCol.findOne({ id })) as Case | null;
  },

  async getCasesByUserId(userId: string): Promise<Case[]> {
    const casesCol = await getCasesCollection();
  return (await casesCol.find({ userId }).toArray()) as Case[];
  },

  async updateCase(id: string, updates: UpdateCaseRequest): Promise<Case | null> {
    const casesCol = await getCasesCollection();
    const existing = (await casesCol.findOne({ id })) as Case | null;
    if (!existing) return null;

  const set: Partial<Case> & { updatedAt: string } = { ...updates, updatedAt: nowIso() };
    if (updates.status === "paid") set.paidAt = nowIso();
    if (updates.status === "disputed") set.disputedAt = nowIso();
    if (updates.status === "resolved") set.resolvedAt = nowIso();
  const result = await casesCol.findOneAndUpdate({ id }, { $set: set }, { returnDocument: "after" });
  const wrapped = result as { value?: Case | null } | null;
  return wrapped?.value ?? null;
  },

  async deleteCase(id: string): Promise<boolean> {
    const casesCol = await getCasesCollection();
    const res = await casesCol.deleteOne({ id });
    return res.deletedCount === 1;
  },

  async getCases(
    filters?: CaseFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Case>> {
    const casesCol = await getCasesCollection();
    const query: Filter<Case> = {} as Filter<Case>;
    if (filters) {
      if (filters.userId) query.userId = filters.userId;
      if (filters.violationType) query.violationType = filters.violationType;
      if (filters.status) query.status = filters.status;
      if (filters.minFine || filters.maxFine) {
        const fineFilter: Record<string, number> = {};
        if (filters.minFine) fineFilter.$gte = filters.minFine;
        if (filters.maxFine) fineFilter.$lte = filters.maxFine;
        query.fine = fineFilter as unknown as Filter<Case>["fine"];
      }
      if (filters.dateFrom || filters.dateTo) {
        const dateFilter: Record<string, string> = {};
        if (filters.dateFrom) dateFilter.$gte = filters.dateFrom;
        if (filters.dateTo) dateFilter.$lte = filters.dateTo;
        query.date = dateFilter as unknown as Filter<Case>["date"];
      }
      if (filters.isPaid !== undefined) query.status = filters.isPaid ? "paid" : { $ne: "paid" };
      if (filters.isDisputed !== undefined) query.status = filters.isDisputed ? "disputed" : { $ne: "disputed" };
    }
    const cursor = casesCol.find(query).sort({ createdAt: -1 });
    return paginate<Case>(cursor, page, limit, () => casesCol.countDocuments(query));
  },

  async createQuery(queryData: CreateQueryRequest): Promise<Query> {
    const validation = validateQuery(queryData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }
    const queriesCol = await getQueriesCollection();
    const query: Query = {
      id: generateId("query"),
      userId: queryData.userId,
      caseId: queryData.caseId,
      subject: queryData.subject,
      message: queryData.message,
      category: queryData.category,
      priority: queryData.priority || "medium",
      status: "open",
      date: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      responses: [],
      attachments: [],
      tags: [],
      isUrgent: queryData.isUrgent || false,
    };
  await queriesCol.insertOne(query);
    return query;
  },

  async getQueryById(id: string): Promise<Query | null> {
  const queriesCol = await getQueriesCollection();
  const q = (await queriesCol.findOne({ id })) as Query | null;
  if (!q) return null;
    const [responsesCol, attachmentsCol] = await Promise.all([
      getQueryResponsesCollection(),
      getQueryAttachmentsCollection(),
    ]);
  const responses = (await responsesCol.find({ queryId: id }).toArray()) as QueryResponse[];
  const attachments = (await attachmentsCol.find({ queryId: id }).toArray()) as QueryAttachment[];
  q.responses = responses;
  q.attachments = attachments;
    return q;
  },

  async getQueriesByUserId(userId: string): Promise<Query[]> {
    const queriesCol = await getQueriesCollection();
  const list = (await queriesCol.find({ userId }).toArray()) as Query[];
    const [responsesCol, attachmentsCol] = await Promise.all([
      getQueryResponsesCollection(),
      getQueryAttachmentsCollection(),
    ]);
    const ids = list.map((q) => q.id);
  const responses = (await responsesCol.find({ queryId: { $in: ids } }).toArray()) as QueryResponse[];
  const attachments = (await attachmentsCol.find({ queryId: { $in: ids } }).toArray()) as QueryAttachment[];
    const queryIdToResponses = new Map<string, QueryResponse[]>();
    const queryIdToAttachments = new Map<string, QueryAttachment[]>();
    responses.forEach((r) => {
      queryIdToResponses.set(r.queryId, [
        ...(queryIdToResponses.get(r.queryId) || []),
        r,
      ]);
    });
    attachments.forEach((a) => {
      if (!a.queryId) return;
      queryIdToAttachments.set(a.queryId, [
        ...(queryIdToAttachments.get(a.queryId) || []),
        a,
      ]);
    });
    return list.map((q) => ({
      ...q,
      responses: queryIdToResponses.get(q.id) || [],
      attachments: queryIdToAttachments.get(q.id) || [],
    }));
  },

  async updateQuery(id: string, updates: Partial<Query>): Promise<Query | null> {
    const queriesCol = await getQueriesCollection();
    const existing = (await queriesCol.findOne({ id })) as Query | null;
    if (!existing) return null;
    const set: Partial<Query> & { updatedAt: string } = { ...updates, updatedAt: nowIso() };
    if (updates.status === "resolved") set.resolvedAt = nowIso();
  const result = await queriesCol.findOneAndUpdate({ id }, { $set: set }, { returnDocument: "after" });
  const wrapped = result as { value?: Query | null } | null;
  return wrapped?.value ?? null;
  },

  async deleteQuery(id: string): Promise<boolean> {
    const queriesCol = await getQueriesCollection();
    const [responsesCol, attachmentsCol] = await Promise.all([
      getQueryResponsesCollection(),
      getQueryAttachmentsCollection(),
    ]);
    await Promise.all([
      responsesCol.deleteMany({ queryId: id }),
      attachmentsCol.deleteMany({ queryId: id }),
    ]);
    const res = await queriesCol.deleteOne({ id });
    return res.deletedCount === 1;
  },

  async getQueries(
    filters?: QueryFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Query>> {
    const queriesCol = await getQueriesCollection();
    const query: Filter<Query> = {} as Filter<Query>;
    if (filters) {
      if (filters.userId) query.userId = filters.userId;
      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;
      if (filters.dateFrom || filters.dateTo) {
        const dateFilter: Record<string, string> = {};
        if (filters.dateFrom) dateFilter.$gte = filters.dateFrom;
        if (filters.dateTo) dateFilter.$lte = filters.dateTo;
        query.date = dateFilter as unknown as Filter<Query>["date"];
      }
      if (filters.isUrgent !== undefined) query.isUrgent = filters.isUrgent;
      if (filters.hasAttachments !== undefined) {
        // Will be post-processed after fetching
      }
    }

  const basePage = await paginate<Query>(queriesCol.find(query).sort({ createdAt: -1 }), page, limit, () => queriesCol.countDocuments(query));

    // Enrich with relations
    const [responsesCol, attachmentsCol] = await Promise.all([
      getQueryResponsesCollection(),
      getQueryAttachmentsCollection(),
    ]);
    const ids = basePage.data.map((q) => q.id);
  const responses = (await responsesCol.find({ queryId: { $in: ids } }).toArray()) as QueryResponse[];
  const attachments = (await attachmentsCol.find({ queryId: { $in: ids } }).toArray()) as QueryAttachment[];
    const queryIdToResponses = new Map<string, QueryResponse[]>();
    const queryIdToAttachments = new Map<string, QueryAttachment[]>();
    responses.forEach((r) => {
      queryIdToResponses.set(r.queryId, [
        ...(queryIdToResponses.get(r.queryId) || []),
        r,
      ]);
    });
    attachments.forEach((a) => {
      if (!a.queryId) return;
      queryIdToAttachments.set(a.queryId, [
        ...(queryIdToAttachments.get(a.queryId) || []),
        a,
      ]);
    });
    let enriched = basePage.data.map((q) => ({
      ...q,
      responses: queryIdToResponses.get(q.id) || [],
      attachments: queryIdToAttachments.get(q.id) || [],
    }));
    if (filters && filters.hasAttachments !== undefined) {
      enriched = enriched.filter((q) => ((q.attachments && q.attachments.length > 0) === filters.hasAttachments));
    }
    return { ...basePage, data: enriched };
  },

  async createQueryResponse(
    responseData: CreateQueryResponseRequest
  ): Promise<QueryResponse> {
    const responsesCol = await getQueryResponsesCollection();
    const response: QueryResponse = {
      id: generateId("response"),
      queryId: responseData.queryId,
      message: responseData.message,
      respondedBy: "current-user",
      respondedAt: nowIso(),
      isFromAdmin: responseData.isFromAdmin,
      template: responseData.template,
      priority: responseData.priority,
      internalNotes: responseData.internalNotes,
      isEdited: false,
    };
  await responsesCol.insertOne(response);
    const queriesCol = await getQueriesCollection();
    const set: Partial<Query> & { updatedAt: string } = {
      status: responseData.markAsResolved ? "resolved" : "in_progress",
      lastResponseAt: response.respondedAt,
      updatedAt: nowIso(),
    };
    if (responseData.markAsResolved) set.resolvedAt = nowIso();
    await queriesCol.updateOne({ id: responseData.queryId }, { $set: set });
    return response;
  },

  async createQueryAttachment(attachmentData: Partial<QueryAttachment> & { queryId?: string; responseId?: string; filename: string; originalName: string; fileSize: number; fileType: string; url: string; uploadedBy?: string; isPublic?: boolean }): Promise<QueryAttachment> {
    const attachmentsCol = await getQueryAttachmentsCollection();
    const attachment: QueryAttachment = {
      id: generateId("attachment"),
      queryId: attachmentData.queryId,
      responseId: attachmentData.responseId,
      filename: attachmentData.filename,
      originalName: attachmentData.originalName,
      fileSize: attachmentData.fileSize,
      fileType: attachmentData.fileType,
      url: attachmentData.url,
      uploadedAt: nowIso(),
      uploadedBy: attachmentData.uploadedBy || "admin",
      isPublic: attachmentData.isPublic !== undefined ? attachmentData.isPublic : true,
    } as QueryAttachment;
  await attachmentsCol.insertOne(attachment);
    return attachment;
  },

  async getQueryResponses(queryId: string): Promise<QueryResponse[]> {
    const responsesCol = await getQueryResponsesCollection();
    const responses = (await responsesCol.find({ queryId }).toArray()) as QueryResponse[];
    return responses.sort((a, b) => new Date(a.respondedAt).getTime() - new Date(b.respondedAt).getTime());
  },

  async createPayment(payment: Partial<PaymentTransaction> & { caseId?: string }): Promise<PaymentTransaction> {
    const paymentsCol = await getPaymentsCollection();
    const src = payment as Partial<PaymentTransaction & { caseId?: string }>;
    const defaultMethod: PaymentTransaction["method"] = {
      id: "bank",
      type: "bank_transfer",
      provider: "bank",
    } as PaymentTransaction["method"];
    const record: PaymentTransaction = {
      id: generateId("payment"),
      violationId: src.violationId ?? src.caseId ?? "",
      amount: src.amount ?? 0,
      currency: src.currency ?? "USD",
      status: src.status ?? "completed",
      method: src.method ?? defaultMethod,
      transactionId: src.transactionId,
      processingFee: src.processingFee,
      netAmount: src.netAmount,
      paidAt: src.paidAt ?? nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await paymentsCol.insertOne(record);
    return record;
  },

  async getPaymentsByCaseId(caseId: string): Promise<PaymentTransaction[]> {
    const paymentsCol = await getPaymentsCollection();
    return (await paymentsCol.find({ violationId: caseId }).toArray()) as PaymentTransaction[];
  },

  async getUserStats(): Promise<UserStats> {
    const users = await getUsersCollection();
    const all = (await users.find({}).toArray()) as User[];
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return {
      totalUsers: all.length,
      activeUsers: all.filter((u) => u.isActive).length,
      newUsersThisMonth: all.filter((u) => u.createdAt >= thisMonth).length,
      usersByRole: {
        user: all.filter((u) => u.role === "user").length,
        admin: all.filter((u) => u.role === "admin").length,
        super_admin: all.filter((u) => u.role === "super_admin").length,
      },
    } as UserStats;
  },

  async getCaseStats(): Promise<CaseStats> {
    const casesCol = await getCasesCollection();
    const cases = (await casesCol.find({}).toArray()) as Case[];
  const casesByType: Record<Case["violationType"], number> = {
      speeding: 0,
      parking: 0,
      traffic_light: 0,
      no_helmet: 0,
      wrong_lane: 0,
      mobile_use: 0,
      other: 0,
  };
    cases.forEach((c) => {
      casesByType[c.violationType] = (casesByType[c.violationType] || 0) + 1;
    });
    const casesByMonth: Record<string, number> = {};
    cases.forEach((c) => {
      const date = new Date(c.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      casesByMonth[key] = (casesByMonth[key] || 0) + 1;
    });
    return {
      totalCases: cases.length,
      pendingCases: cases.filter((c) => c.status === "pending").length,
      paidCases: cases.filter((c) => c.status === "paid").length,
      disputedCases: cases.filter((c) => c.status === "disputed").length,
      totalFines: cases.reduce((sum, c) => sum + c.fine, 0),
      collectedFines: cases
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.fine, 0),
      casesByType,
      casesByMonth,
    } as CaseStats;
  },

  async getQueryStats(): Promise<QueryStats> {
    const queriesCol = await getQueriesCollection();
    const queries = (await queriesCol.find({}).toArray()) as Query[];
    const resolved = queries.filter((q) => q.status === "resolved");
    const totalResponseTime = resolved.reduce((sum, q) => {
      if (q.resolvedAt) {
        const created = new Date(q.createdAt).getTime();
        const resolvedAt = new Date(q.resolvedAt).getTime();
        return sum + (resolvedAt - created);
      }
      return sum;
    }, 0);
    const averageResponseTime = resolved.length > 0 ? totalResponseTime / resolved.length / (1000 * 60 * 60) : 0;
    return {
      totalQueries: queries.length,
      openQueries: queries.filter((q) => q.status === "open").length,
      resolvedQueries: resolved.length,
      averageResponseTime,
      queriesByCategory: {
        violation_dispute: queries.filter((q) => q.category === "violation_dispute").length,
        payment_issues: queries.filter((q) => q.category === "payment_issues").length,
        technical_support: queries.filter((q) => q.category === "technical_support").length,
        general_inquiry: queries.filter((q) => q.category === "general_inquiry").length,
      },
      queriesByPriority: {
        low: queries.filter((q) => q.priority === "low").length,
        medium: queries.filter((q) => q.priority === "medium").length,
        high: queries.filter((q) => q.priority === "high").length,
      },
    } as QueryStats;
  },
};

export default db;


