/**
 * Centralized API service layer for A-FEWS.
 *
 * All API calls go through this module — never scattered in components.
 * Base URL is read from src/config/api.ts which reads VITE_API_BASE from .env.
 */

import API_BASE_URL from "@/config/api";

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = "afews_access_token";
const REFRESH_KEY = "afews_refresh_token";

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ─── Response envelope ────────────────────────────────────────────────────────
// Matches the backend APIResponse[T] envelope.

export interface APIEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Request helper ───────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string>;
  /** Set to false to skip the Authorization header (public endpoints). */
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, auth = true, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...rest,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, config);

  // Auto-refresh: on 401, try refreshing the token once then retry
  if (response.status === 401 && auth) {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        if (refreshRes.ok) {
          const envelope = await refreshRes.json() as APIEnvelope<TokenData>;
          tokenStore.set(envelope.data.access_token, envelope.data.refresh_token);
          // Retry original request with new token
          headers["Authorization"] = `Bearer ${envelope.data.access_token}`;
          const retryRes = await fetch(url, { ...config, headers });
          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => null);
            const msg =
              (errData as { error?: { message?: string } })?.error?.message ??
              (errData as { message?: string })?.message ??
              `Request failed: ${retryRes.statusText}`;
            throw new ApiError(msg, retryRes.status, errData);
          }
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json();
        }
      } catch {
        // Refresh failed — clear tokens so AuthContext redirects to login
        tokenStore.clear();
      }
    }
    // No refresh token or refresh failed
    tokenStore.clear();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      (errorData as { error?: { message?: string }; message?: string })?.error?.message ??
      (errorData as { message?: string })?.message ??
      `Request failed: ${response.statusText}`;
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface OTPRequestData {
  request_id: string;
  phone_masked: string;
  expires_in: number;
  channel: string;
}

export interface OTPTokenData {
  otp_token: string;
  token_type: string;
  expires_in: number;
}

export interface AreaOption {
  id: string;
  name: string;
  city: string;
  country: string;
}

/** Full area record returned by GET /areas. */
export interface AreaRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  source?: string | null;
  source_external_id?: string | null;
  source_query?: string | null;
  boundary?: Record<string, unknown> | null;
  centroid_lon?: number | null;
  centroid_lat?: number | null;
  created_at: string;
  updated_at: string;
}

/** Area risk summary item returned by GET /risk/areas. */
export interface AreaRiskItem {
  id: string;
  area_id: string;
  run_at: string;
  horizon_h: number;
  aggregated_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  tile_count: number;
  explanation_json?: unknown;
}

/** Alert record returned by the alerts API. */
export interface AlertRecord {
  id: string;
  area_id?: string | null;
  horizon_h: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  status: "DRAFT" | "APPROVED" | "REJECTED" | "SENT";
  title: string;
  message: string;
  created_by: string;
  created_by_name?: string | null;
  approved_by?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Staff user record returned by GET /users. */
export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

/** Per-alert-channel delivery aggregate returned by GET /deliveries. */
export interface DeliveryRow {
  id: string;
  alert_id: string;
  alert_title: string;
  area_name?: string | null;
  channel: string;
  sent: number;
  failed: number;
  pending: number;
  status: "complete" | "in_progress" | "failed";
  dispatched_at?: string | null;
}

/** Audit log entry returned by GET /audit. */
export interface AuditEntry {
  id: string;
  action: string;
  user_id?: string | null;
  user_name?: string | null;
  user_role?: string | null;
  resource_type?: string | null;
  resource_id?: string | null;
  details_json?: unknown;
  created_at: string;
}

/** Admin subscription item returned by GET /subscriptions/admin/list. */
export interface AdminSubItem {
  id: string;
  phone: string;
  channel: string;
  is_active: boolean;
  areas: { area_id: string; name: string }[];
  opt_in_at: string;
  created_at: string;
}

/** Candidate area returned by POST /areas/import/search. */
export interface AreaImportCandidate {
  external_id: string;
  source: string;
  display_name: string;
  bounding_box?: [number, number, number, number] | null;
  geometry?: Record<string, unknown> | null;
}

export interface AreaRisk {
  area_id: string;
  area_name: string;
  city: string;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "SEVERE" | null;
  risk_score: number | null;
  subscribed_at: string;
}

export interface SubscriptionManageData {
  phone: string;
  channels: string[];
  areas: AreaRisk[];
}

export interface SubscriptionRecord {
  id: string;
  phone: string;
  channel: string;
  is_active: boolean;
  opt_in_at: string;
  opt_out_at: string | null;
  areas: { area_id: string; created_at: string }[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionStats {
  active_subscriptions: number;
  delivery_sent: number;
  delivery_failed: number;
  delivery_pending: number;
}

// ─── API modules ──────────────────────────────────────────────────────────────

// Auth / OTP
export const authApi = {
  /** Step 1 of staff login: sends OTP to the phone linked to the staff account's email. */
  loginOtpRequest: (email: string) =>
    request<APIEnvelope<OTPRequestData>>("/auth/login/otp-request", {
      method: "POST",
      auth: false,
      body: { email },
    }),

  /** Step 2 of staff login: email + password + OTP code. */
  login: (email: string, password: string, otp_code: string) =>
    request<APIEnvelope<TokenData>>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password, otp_code },
    }),

  register: (data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    phone_token: string;
  }) =>
    request<APIEnvelope<TokenData>>("/auth/register", {
      method: "POST",
      auth: false,
      body: data,
    }),

  logout: () =>
    request<APIEnvelope<null>>("/auth/logout", { method: "POST" }),

  forgotPassword: (email: string) =>
    request<APIEnvelope<unknown>>("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    request<APIEnvelope<unknown>>("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: { token, password },
    }),

  changePassword: (current_password: string, new_password: string) =>
    request<APIEnvelope<unknown>>("/auth/password/change", {
      method: "POST",
      body: { current_password, new_password },
    }),

  refreshToken: (refresh_token: string) =>
    request<APIEnvelope<TokenData>>("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refresh_token },
    }),

  me: () =>
    request<APIEnvelope<{ id: string; email: string; role: string; full_name?: string }>>("/auth/me"),

  /** Public OTP request for SMS subscriber phone verification (not staff login). */
  requestOtp: (phone: string, channel: "sms" | "whatsapp" = "sms") =>
    request<APIEnvelope<OTPRequestData>>("/auth/otp/request", {
      method: "POST",
      auth: false,
      body: { phone, channel },
    }),

  /** Verify OTP code and receive a phone_token for subscription operations. */
  verifyOtp: (phone: string, code: string) =>
    request<APIEnvelope<OTPTokenData>>("/auth/otp/verify", {
      method: "POST",
      auth: false,
      body: { phone, code },
    }),
};

// Subscriptions
export const subscriptionApi = {
  /** Get all active subscriptions + area risk levels for a phone number. */
  getManageView: (phone: string, phone_token: string) =>
    request<APIEnvelope<SubscriptionManageData>>("/subscriptions", {
      auth: false,
      params: { phone, phone_token },
    }),

  optIn: (data: { phone: string; channels: string[]; phone_token: string; area_ids: string[] }) =>
    request<APIEnvelope<SubscriptionRecord[]>>("/subscriptions/opt-in", {
      method: "POST",
      auth: false,
      body: data,
    }),

  optOut: (data: { phone: string; channel: string; phone_token: string }) =>
    request<APIEnvelope<SubscriptionRecord>>("/subscriptions/opt-out", {
      method: "POST",
      auth: false,
      body: data,
    }),

  updateAreas: (data: { phone: string; channel: string; phone_token: string; area_ids: string[] }) =>
    request<APIEnvelope<SubscriptionRecord>>("/subscriptions/areas", {
      method: "PUT",
      auth: false,
      body: data,
    }),
};

// Admin aggregates (ADMIN role required)
export const adminApi = {
  subscriptionStats: () =>
    request<APIEnvelope<SubscriptionStats>>("/subscriptions/stats"),
};

// Areas
export const areaApi = {
  listPublic: (params?: Record<string, string>) =>
    request<APIEnvelope<AreaRecord[]>>("/subscriptions/available-areas", { params, auth: false }),
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: AreaRecord[] }>>("/areas", { params }),
  get: (id: string) =>
    request<APIEnvelope<AreaRecord>>(`/areas/${id}`),
  create: (data: unknown) =>
    request<APIEnvelope<AreaRecord>>("/areas", { method: "POST", body: data }),
  update: (id: string, data: unknown) =>
    request<APIEnvelope<AreaRecord>>(`/areas/${id}`, { method: "PATCH", body: data }),
  generateTiles: (id: string) =>
    request<APIEnvelope<unknown>>(`/areas/${id}/tiles/generate`, { method: "POST" }),
  importSearch: (data: { name: string; city?: string; source_preference?: string }) =>
    request<APIEnvelope<AreaImportCandidate[]>>("/areas/import/search", { method: "POST", body: data }),
  importConfirm: (data: {
    name: string;
    city?: string;
    country?: string;
    source: string;
    external_id: string;
    geometry: Record<string, unknown>;
    source_query?: string;
  }) =>
    request<APIEnvelope<AreaRecord>>("/areas/import/confirm", { method: "POST", body: data }),
  importGeojson: (data: {
    name: string;
    city?: string;
    country?: string;
    geometry: Record<string, unknown>;
  }) =>
    request<APIEnvelope<AreaRecord>>("/areas/import/geojson", { method: "POST", body: data }),
};

// Risk
export const riskApi = {
  overview: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: AreaRiskItem[] }>>("/risk/areas", { params }),
  hotspots: (params?: Record<string, string>) =>
    request<APIEnvelope<AreaRiskItem[]>>("/risk/hotspots", { params }),
  getArea: (areaId: string, horizon?: string) =>
    request<APIEnvelope<unknown>>(`/risk/areas/${areaId}`, {
      params: horizon ? { horizon } : undefined,
    }),
};

// Alerts
export const alertApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: AlertRecord[]; page: number; page_size: number }>>("/alerts", { params }),
  get: (id: string) =>
    request<APIEnvelope<AlertRecord>>(`/alerts/${id}`),
  create: (data: {
    area_id?: string;
    horizon_h: number;
    risk_level: string;
    title: string;
    message: string;
  }) =>
    request<APIEnvelope<AlertRecord>>("/alerts/draft", { method: "POST", body: data }),
  approve: (id: string) =>
    request<APIEnvelope<unknown>>(`/alerts/${id}/approve`, { method: "POST" }),
  reject: (id: string, reason: string) =>
    request<APIEnvelope<unknown>>(`/alerts/${id}/reject`, { method: "POST", body: { reason } }),
  send: (id: string) =>
    request<APIEnvelope<unknown>>(`/alerts/${id}/send`, { method: "POST" }),
};

// Deliveries
export const deliveryApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: DeliveryRow[]; total: number }>>("/deliveries", { params }),
  getByAlert: (alertId: string) =>
    request<APIEnvelope<DeliveryRow[]>>(`/deliveries/alert/${alertId}`),
};

// Reports
export const reportApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<unknown[]>>("/reports", { params }),
  create: (data: { area: string; report_type: string; severity: string; notes: string }) =>
    request<APIEnvelope<unknown>>("/reports", { method: "POST", body: data }),
};

// Users
export const userApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: UserRecord[]; total: number }>>("/users", { params }),
  get: (id: string) => request<APIEnvelope<UserRecord>>(`/users/${id}`),
  updateRole: (id: string, role: string) =>
    request<APIEnvelope<void>>(`/users/${id}/role`, { method: "PUT", body: { role } }),
};

// Health
export const healthApi = {
  all: () => request<APIEnvelope<unknown>>("/health", { auth: false }),
  db: () => request<APIEnvelope<{ status: string }>>("/health/db", { auth: false }),
};

// Audit
export const auditApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: AuditEntry[]; total: number }>>("/audit", { params }),
};

// Admin subscriptions
export const subscriptionAdminApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<{ items: AdminSubItem[]; total: number }>>("/subscriptions/admin/list", { params }),
};

// Jobs
export const jobApi = {
  list: () => request<APIEnvelope<unknown[]>>("/jobs"),
  trigger: (jobType: string) => {
    if (jobType === "compute-risk") {
      return request<APIEnvelope<unknown>>("/jobs/compute-risk", {
        method: "POST",
        body: { city: "Accra", horizon_h: 24 },
      });
    }
    const sourceMap: Record<string, string> = {
      "ingest-openmeteo": "open_meteo",
      "ingest-chirps": "chirps",
      "ingest-dem": "copernicus_dem",
      "compute-features": "open_meteo",
    };
    return request<APIEnvelope<unknown>>("/jobs/ingest", {
      method: "POST",
      body: { city: "Accra", source_name: sourceMap[jobType] ?? jobType },
    });
  },
};

// Settings / Profile
export const settingsApi = {
  getProfile: () => request<APIEnvelope<unknown>>("/auth/me"),
  updateProfile: (data: { full_name: string }) =>
    request<APIEnvelope<unknown>>("/auth/me", { method: "PATCH", body: data }),
};

// Ingestion
export const ingestionApi = {
  trigger: (sourceId: string) =>
    request<APIEnvelope<unknown>>(`/ingestion/${sourceId}/trigger`, { method: "POST" }),
};
