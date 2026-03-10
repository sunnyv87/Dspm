// ─── Common Types ─────────────────────────────────────────────────────────────

/** UUID string identifier (v4) */
export type UUID = string;

/** ISO 8601 date-time string */
export type ISODateString = string;

/** Duration expressed as an ISO 8601 duration string, e.g. "P30D", "P1Y" */
export type ISODuration = string;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export interface SortParams {
  sortBy: string;
  sortDirection: SortDirection;
}

// ─── Filtering ────────────────────────────────────────────────────────────────

export enum FilterOperator {
  EQUALS = "eq",
  NOT_EQUALS = "neq",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  IN = "in",
  NOT_IN = "nin",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
  BETWEEN = "between",
}

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface QueryParams extends PaginationParams {
  sort?: SortParams[];
  filters?: QueryFilter[];
  search?: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
  traceId?: string;
  timestamp: ISODateString;
  path?: string;
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

// ─── API Response Envelope ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

// ─── Tenant Context ──────────────────────────────────────────────────────────

export interface TenantContext {
  tenantId: UUID;
  tenantSlug: string;
  userId: UUID;
  roles: string[];
  permissions: string[];
  sessionId: UUID;
}

// ─── Base Entity ──────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface TenantScopedEntity extends BaseEntity {
  tenantId: UUID;
}

export interface AuditableEntity extends TenantScopedEntity {
  createdBy: UUID;
  updatedBy?: UUID;
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export interface SoftDeletable {
  deletedAt?: ISODateString;
  deletedBy?: UUID;
  isDeleted: boolean;
}

// ─── Bulk Operations ─────────────────────────────────────────────────────────

export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    index: number;
    id?: UUID;
    error: string;
  }>;
}

// ─── Event ────────────────────────────────────────────────────────────────────

export interface DomainEvent {
  eventId: UUID;
  eventType: string;
  aggregateId: UUID;
  aggregateType: string;
  tenantId: UUID;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
  occurredAt: ISODateString;
}

export interface EventMetadata {
  userId?: UUID;
  correlationId?: UUID;
  causationId?: UUID;
  version: number;
}
