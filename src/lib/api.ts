/**
 * Centralized API service layer for A-FEWS.
 * All API calls go through this module — never scattered in components.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const config: RequestInit = {
    ...rest,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.message || `Request failed: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Auth / OTP ───
export const authApi = {
  requestOtp: (phone: string, channel: "sms" | "whatsapp") =>
    request<{ message: string }>("/auth/otp/request", {
      method: "POST",
      body: { phone, channel },
    }),
  verifyOtp: (phone: string, code: string) =>
    request<{ phone_token: string }>("/auth/otp/verify", {
      method: "POST",
      body: { phone, code },
    }),
  login: (email: string, password: string, otp: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email, password, otp },
    }),
};

// ─── Subscriptions ───
export const subscriptionApi = {
  optIn: (data: { phone: string; channel: string; phone_token: string; area_ids: string[] }) =>
    request<{ message: string }>("/subscriptions/opt-in", { method: "POST", body: data }),
  optOut: (data: { phone: string; channel: string; phone_token: string }) =>
    request<void>("/subscriptions/opt-out", { method: "POST", body: data }),
  updateAreas: (data: { phone: string; channel: string; phone_token: string; area_ids: string[] }) =>
    request<void>("/subscriptions/areas", { method: "PUT", body: data }),
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/subscriptions", { params }),
};

// ─── Areas ───
export const areaApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/areas", { params }),
  get: (id: string) =>
    request<unknown>(`/areas/${id}`),
  create: (data: unknown) =>
    request<unknown>("/areas", { method: "POST", body: data }),
  update: (id: string, data: unknown) =>
    request<unknown>(`/areas/${id}`, { method: "PUT", body: data }),
  searchDataset: (query: string, source?: string) =>
    request<unknown[]>("/areas/search", { params: { q: query, ...(source ? { source } : {}) } }),
};

// ─── Tiles ───
export const tileApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/tiles", { params }),
  get: (id: string) =>
    request<unknown>(`/tiles/${id}`),
  generate: (data: { area_id: string; bbox?: string; tile_size: number }) =>
    request<{ count: number }>("/tiles/generate", { method: "POST", body: data }),
};

// ─── Risk ───
export const riskApi = {
  overview: (params?: Record<string, string>) =>
    request<unknown[]>("/risk", { params }),
  getArea: (areaId: string, horizon?: string) =>
    request<unknown>(`/risk/areas/${areaId}`, { params: horizon ? { horizon } : undefined }),
  computeStatus: () =>
    request<unknown>("/risk/status"),
};

// ─── Alerts ───
export const alertApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/alerts", { params }),
  get: (id: string) =>
    request<unknown>(`/alerts/${id}`),
  create: (data: unknown) =>
    request<unknown>("/alerts", { method: "POST", body: data }),
  approve: (id: string) =>
    request<void>(`/alerts/${id}/approve`, { method: "POST" }),
  reject: (id: string, reason: string) =>
    request<void>(`/alerts/${id}/reject`, { method: "POST", body: { reason } }),
  send: (id: string) =>
    request<void>(`/alerts/${id}/send`, { method: "POST" }),
};

// ─── Deliveries ───
export const deliveryApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/deliveries", { params }),
  getByAlert: (alertId: string) =>
    request<unknown[]>(`/deliveries/alert/${alertId}`),
};

// ─── Reports ───
export const reportApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/reports", { params }),
  create: (data: FormData) =>
    fetch(`${API_BASE}/reports`, { method: "POST", body: data }),
};

// ─── Users ───
export const userApi = {
  list: () => request<unknown[]>("/users"),
  get: (id: string) => request<unknown>(`/users/${id}`),
  updateRole: (id: string, role: string) =>
    request<void>(`/users/${id}/role`, { method: "PUT", body: { role } }),
};

// ─── Ingestion ───
export const ingestionApi = {
  status: () => request<unknown>("/ingestion/status"),
  trigger: (pipeline: string) =>
    request<unknown>(`/ingestion/${pipeline}/trigger`, { method: "POST" }),
};

// ─── Jobs ───
export const jobApi = {
  list: () => request<unknown[]>("/jobs"),
  trigger: (jobType: string) =>
    request<unknown>(`/jobs/${jobType}/trigger`, { method: "POST" }),
};

// ─── Health ───
export const healthApi = {
  db: () => request<{ status: string }>("/health/db"),
  gcs: () => request<{ status: string }>("/health/gcs"),
  all: () => request<unknown>("/health"),
};

// ─── Audit ───
export const auditApi = {
  list: (params?: Record<string, string>) =>
    request<unknown[]>("/audit", { params }),
};

// ─── Settings ───
export const settingsApi = {
  get: () => request<unknown>("/settings"),
  update: (data: unknown) =>
    request<unknown>("/settings", { method: "PUT", body: data }),
  getProfile: () => request<unknown>("/profile"),
  updateProfile: (data: unknown) =>
    request<unknown>("/profile", { method: "PUT", body: data }),
};

export { ApiError };
