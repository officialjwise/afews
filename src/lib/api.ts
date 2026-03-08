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

  logout: () =>
    request<APIEnvelope<null>>("/auth/logout", { method: "POST" }),

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

// Areas
export const areaApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<AreaOption[]>>("/areas", { params }),
  get: (id: string) =>
    request<APIEnvelope<AreaOption>>(`/areas/${id}`),
  create: (data: unknown) =>
    request<APIEnvelope<AreaOption>>("/areas", { method: "POST", body: data }),
  update: (id: string, data: unknown) =>
    request<APIEnvelope<AreaOption>>(`/areas/${id}`, { method: "PATCH", body: data }),
};

// Risk
export const riskApi = {
  overview: (params?: Record<string, string>) =>
    request<APIEnvelope<unknown[]>>("/risk", { params }),
  getArea: (areaId: string, horizon?: string) =>
    request<APIEnvelope<unknown>>(`/risk/areas/${areaId}`, {
      params: horizon ? { horizon } : undefined,
    }),
};

// Alerts
export const alertApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<unknown[]>>("/alerts", { params }),
  get: (id: string) =>
    request<APIEnvelope<unknown>>(`/alerts/${id}`),
  create: (data: unknown) =>
    request<APIEnvelope<unknown>>("/alerts", { method: "POST", body: data }),
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
    request<APIEnvelope<unknown[]>>("/deliveries", { params }),
  getByAlert: (alertId: string) =>
    request<APIEnvelope<unknown[]>>(`/deliveries/alert/${alertId}`),
};

// Reports
export const reportApi = {
  list: (params?: Record<string, string>) =>
    request<APIEnvelope<unknown[]>>("/reports", { params }),
  create: (data: FormData) => {
    const token = tokenStore.getAccess();
    return fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      body: data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

// Users
export const userApi = {
  list: () => request<APIEnvelope<unknown[]>>("/users"),
  get: (id: string) => request<APIEnvelope<unknown>>(`/users/${id}`),
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
    request<APIEnvelope<unknown[]>>("/audit", { params }),
};

// Jobs
export const jobApi = {
  list: () => request<APIEnvelope<unknown[]>>("/jobs"),
  trigger: (jobType: string) =>
    request<APIEnvelope<unknown>>(`/jobs/${jobType}/trigger`, { method: "POST" }),
};

// Settings / Profile
export const settingsApi = {
  getProfile: () => request<APIEnvelope<unknown>>("/auth/me"),
  updateProfile: (data: unknown) =>
    request<APIEnvelope<unknown>>("/profile", { method: "PUT", body: data }),
};
