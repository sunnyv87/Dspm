import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Token storage using secure cookies instead of localStorage.
 * Cookies are set with SameSite=Strict and Secure (in production) flags
 * to mitigate XSS token theft and CSRF attacks.
 */
function getSecureCookieOptions(): string {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = ["path=/", "SameSite=Strict"];
  if (isSecure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function setToken(token: string): void {
  if (typeof document !== "undefined") {
    const maxAge = 3600; // 1 hour — matches typical JWT expiry
    document.cookie = `dspm_token=${encodeURIComponent(token)}; max-age=${maxAge}; ${getSecureCookieOptions()}`;
  }
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)dspm_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken(): void {
  if (typeof document !== "undefined") {
    document.cookie = `dspm_token=; max-age=0; ${getSecureCookieOptions()}`;
  }
}

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (data: { email: string; password: string; full_name?: string }) => api.post("/auth/register", data),
};

// --- Connectors ---
export const connectorAPI = {
  list: () => api.get("/connectors/"),
  get: (id: string) => api.get(`/connectors/${id}`),
  create: (data: any) => api.post("/connectors/", data),
  update: (id: string, data: any) => api.patch(`/connectors/${id}`, data),
  delete: (id: string) => api.delete(`/connectors/${id}`),
  test: (data: any) => api.post("/connectors/test", data),
  health: (id: string) => api.get(`/connectors/${id}/health`),
};

// --- Scans ---
export const scanAPI = {
  list: (connectorId?: string) => api.get("/scans/", { params: { connector_id: connectorId } }),
  get: (id: string) => api.get(`/scans/${id}`),
  create: (data: any) => api.post("/scans/", data),
  pause: (id: string) => api.post(`/scans/${id}/pause`),
  cancel: (id: string) => api.post(`/scans/${id}/cancel`),
  assets: (id: string) => api.get(`/scans/${id}/assets`),
};

// --- Classification ---
export const classificationAPI = {
  rules: () => api.get("/classification/rules"),
  createRule: (data: any) => api.post("/classification/rules", data),
  results: (assetId: string) => api.get(`/classification/results/${assetId}`),
  feedback: (data: any) => api.post("/classification/feedback", data),
};

// --- Assets ---
export const assetAPI = {
  list: (params?: any) => api.get("/assets/", { params }),
  get: (id: string) => api.get(`/assets/${id}`),
  sensitive: () => api.get("/assets/sensitive"),
  exposed: () => api.get("/assets/exposed"),
  stale: () => api.get("/assets/stale"),
  shadow: () => api.get("/assets/shadow"),
  unowned: () => api.get("/assets/unowned"),
  updateOwner: (id: string, data: any) => api.patch(`/assets/${id}/owner`, data),
  addTag: (id: string, data: any) => api.post(`/assets/${id}/tags`, data),
};

// --- Identity ---
export const identityAPI = {
  assetAccess: (assetId: string) => api.get(`/identity/assets/${assetId}/access`),
  sensitiveAssets: (identityId: string) => api.get(`/identity/identities/${identityId}/sensitive-assets`),
  findings: (resolved?: boolean) => api.get("/identity/findings", { params: { resolved } }),
  analyze: () => api.post("/identity/analyze"),
};

// --- Risk ---
export const riskAPI = {
  summary: () => api.get("/risk/summary"),
  trend: (data: any) => api.post("/risk/trend", data),
};

// --- Policies ---
export const policyAPI = {
  rules: () => api.get("/policies/rules"),
  createRule: (data: any) => api.post("/policies/rules", data),
  violations: (status?: string) => api.get("/policies/violations", { params: { status_filter: status } }),
  approveException: (data: any) => api.post("/policies/violations/exception", data),
  complianceCoverage: () => api.get("/policies/compliance/coverage"),
};

// --- Alerts ---
export const alertAPI = {
  list: (params?: any) => api.get("/alerts/", { params }),
  get: (id: string) => api.get(`/alerts/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/alerts/${id}/status`, data),
  assign: (id: string, data: any) => api.patch(`/alerts/${id}/assign`, data),
  addComment: (id: string, data: any) => api.post(`/alerts/${id}/comments`, data),
  createRemediation: (data: any) => api.post("/alerts/remediation", data),
};

// --- Reports ---
export const reportAPI = {
  executiveSummary: () => api.get("/reports/executive-summary"),
  list: () => api.get("/reports/"),
  create: (data: any) => api.post("/reports/", data),
  get: (id: string) => api.get(`/reports/${id}`),
  dashboards: () => api.get("/reports/dashboards/"),
};

// --- Admin ---
export const adminAPI = {
  users: () => api.get("/admin/users"),
  createUser: (data: any) => api.post("/admin/users", data),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  deactivateUser: (id: string) => api.delete(`/admin/users/${id}`),
  roles: () => api.get("/admin/roles"),
  createApiToken: (data: any) => api.post("/admin/api-tokens", data),
  apiTokens: () => api.get("/admin/api-tokens"),
  revokeToken: (id: string) => api.delete(`/admin/api-tokens/${id}`),
};

// --- Audit ---
export const auditAPI = {
  logs: (params?: any) => api.get("/audit/logs", { params }),
  export: (params?: any) => api.get("/audit/export", { params }),
};

// --- AI Query ---
export const aiQueryAPI = {
  query: (query: string) => api.post("/ai/query", { query }),
  suggestions: () => api.get("/ai/suggestions"),
};

// ============================================
// PrivacyOps BFF APIs (unified dashboard)
// ============================================

const PRIVACYOPS_BFF_URL = process.env.NEXT_PUBLIC_PRIVACYOPS_BFF_URL || "http://localhost:4000";

const privacyBff = axios.create({
  baseURL: PRIVACYOPS_BFF_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

privacyBff.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- PrivacyOps Overview ---
export const privacyOverviewAPI = {
  summary: () => privacyBff.get("/overview/summary"),
  metrics: () => privacyBff.get("/overview/metrics"),
  alerts: () => privacyBff.get("/overview/alerts"),
};

// --- Consent Management ---
export const consentAPI = {
  list: (params?: any) => privacyBff.get("/api/v1/consent/records", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/consent/records/${id}`),
  create: (data: any) => privacyBff.post("/api/v1/consent/records", data),
  revoke: (id: string) => privacyBff.post(`/api/v1/consent/records/${id}/revoke`),
  stats: () => privacyBff.get("/api/v1/consent/stats"),
  purposes: () => privacyBff.get("/api/v1/consent/purposes"),
};

// --- Data Subject Rights (DSAR) ---
export const dsarAPI = {
  list: (params?: any) => privacyBff.get("/api/v1/rights/requests", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/rights/requests/${id}`),
  create: (data: any) => privacyBff.post("/api/v1/rights/requests", data),
  updateStatus: (id: string, data: any) => privacyBff.patch(`/api/v1/rights/requests/${id}`, data),
  stats: () => privacyBff.get("/api/v1/rights/stats"),
};

// --- Breach Monitoring ---
export const breachAPI = {
  list: (params?: any) => privacyBff.get("/api/v1/breach/incidents", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/breach/incidents/${id}`),
  create: (data: any) => privacyBff.post("/api/v1/breach/incidents", data),
  updateStatus: (id: string, data: any) => privacyBff.patch(`/api/v1/breach/incidents/${id}`, data),
  stats: () => privacyBff.get("/api/v1/breach/stats"),
};

// --- Vendor Risk ---
export const vendorRiskAPI = {
  list: (params?: any) => privacyBff.get("/api/v1/vendor-risk/vendors", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/vendor-risk/vendors/${id}`),
  create: (data: any) => privacyBff.post("/api/v1/vendor-risk/vendors", data),
  assess: (id: string, data: any) => privacyBff.post(`/api/v1/vendor-risk/vendors/${id}/assess`, data),
  stats: () => privacyBff.get("/api/v1/vendor-risk/stats"),
};

// --- Retention Management ---
export const retentionAPI = {
  policies: (params?: any) => privacyBff.get("/api/v1/retention/policies", { params }),
  getPolicy: (id: string) => privacyBff.get(`/api/v1/retention/policies/${id}`),
  createPolicy: (data: any) => privacyBff.post("/api/v1/retention/policies", data),
  updatePolicy: (id: string, data: any) => privacyBff.patch(`/api/v1/retention/policies/${id}`, data),
  stats: () => privacyBff.get("/api/v1/retention/stats"),
};

// --- Workflow Management ---
export const workflowAPI = {
  list: (params?: any) => privacyBff.get("/api/v1/workflow/instances", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/workflow/instances/${id}`),
  approve: (id: string, data: any) => privacyBff.post(`/api/v1/workflow/instances/${id}/approve`, data),
  reject: (id: string, data: any) => privacyBff.post(`/api/v1/workflow/instances/${id}/reject`, data),
  templates: () => privacyBff.get("/api/v1/workflow/templates"),
};

// --- Privacy Risk ---
export const privacyRiskAPI = {
  assessments: (params?: any) => privacyBff.get("/api/v1/privacy-risk/assessments", { params }),
  get: (id: string) => privacyBff.get(`/api/v1/privacy-risk/assessments/${id}`),
  heatmap: () => privacyBff.get("/api/v1/privacy-risk/heatmap"),
  trends: () => privacyBff.get("/api/v1/privacy-risk/trends"),
  stats: () => privacyBff.get("/api/v1/privacy-risk/stats"),
};

// --- Privacy Audit ---
export const privacyAuditAPI = {
  entries: (params?: any) => privacyBff.get("/api/v1/audit/entries", { params }),
  timeline: (days?: number) => privacyBff.get("/api/v1/audit/timeline", { params: { days } }),
  byUser: (userId: string) => privacyBff.get("/api/v1/audit/entries", { params: { userId } }),
};

// --- Privacy Compliance ---
export const privacyComplianceAPI = {
  stats: () => privacyBff.get("/api/v1/compliance/stats"),
  frameworks: () => privacyBff.get("/api/v1/compliance/frameworks"),
  trends: () => privacyBff.get("/api/v1/compliance/trends"),
};

export default api;
