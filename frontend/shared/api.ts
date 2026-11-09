import { User, WorkOrder, Report, PaginatedResponse, Technician } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("fieldos_token") : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // For FormData the browser must set the multipart boundary itself, so we
  // must NOT send a Content-Type header. For JSON we send it explicitly.
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...authHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: `Request failed (${res.status})` }));
    const detail =
      typeof error?.detail === "string"
        ? error.detail
        : Array.isArray(error?.detail)
          ? error.detail.map((d: any) => d?.msg ?? String(d)).join(", ")
          : `Request failed (${res.status})`;
    throw new Error(detail);
  }

  // Some endpoints may return an empty body (e.g. 204).
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "technician" | "supervisor";
  languagePreference: string;
}

/** Normalised auth payload the app consumes. */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Raw payload returned by the backend (FastAPI uses `access_token`). */
interface RawAuthResponse {
  access_token: string;
  token_type?: string;
  user: User;
}

function normalizeAuth(raw: RawAuthResponse): AuthResponse {
  const user = {
    ...raw.user,
    // Backend demo users omit createdAt; provide a stable fallback.
    createdAt: (raw.user as any)?.createdAt ?? new Date().toISOString(),
  } as User;
  return { token: raw.access_token, user };
}

export const authApi = {
  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const raw = await apiRequest<RawAuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeAuth(raw);
  },
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const raw = await apiRequest<RawAuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeAuth(raw);
  },
};

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export const reportApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    apiRequest<PaginatedResponse<Report>>(
      `/api/v1/reports${buildQuery(params)}`
    ),
  get: (id: string) => apiRequest<Report>(`/api/v1/reports/${id}`),
  create: (data: {
    equipmentId: string;
    equipmentName?: string;
    equipmentMachineNumber?: string;
    issue: string;
    observation?: string;
    category?: string;
    severity?: string;
    language: string;
    audioUrl?: string;
    transcription: string;
    missingFields?: string[];
  }) =>
    apiRequest<Report>("/api/v1/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------
/** Backend returns `assignedTo`; normalise it to `assignedToName` for the UI. */
function normalizeWorkOrder(wo: any): WorkOrder {
  return {
    ...wo,
    assignedToName:
      wo.assignedToName ??
      (wo.assignedTo && wo.assignedTo !== "Unassigned" ? wo.assignedTo : undefined),
  } as WorkOrder;
}

export const workOrderApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await apiRequest<PaginatedResponse<WorkOrder>>(
      `/api/v1/work-orders${buildQuery(params)}`
    );
    return { ...res, data: (res.data ?? []).map(normalizeWorkOrder) };
  },
  get: async (id: string) =>
    normalizeWorkOrder(await apiRequest<WorkOrder>(`/api/v1/work-orders/${id}`)),
  create: (data: {
    title: string;
    description: string;
    equipmentId: string;
    equipmentName: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
    assignedToName?: string;
  }) =>
    apiRequest<WorkOrder>("/api/v1/work-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(normalizeWorkOrder),
  assign: (id: string, technicianId: string, technicianName?: string) =>
    apiRequest<WorkOrder>(`/api/v1/work-orders/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ technicianId, technicianName }),
    }).then(normalizeWorkOrder),
  updateStatus: (id: string, status: string) =>
    apiRequest<WorkOrder>(`/api/v1/work-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).then(normalizeWorkOrder),
};

// ---------------------------------------------------------------------------
// Technicians
// ---------------------------------------------------------------------------
/** Backend returns `currentWO` / `completed`; normalise to the UI shape. */
function normalizeTechnician(t: any): Technician {
  return {
    ...t,
    currentWorkOrderId: t.currentWorkOrderId ?? (t.currentWO && t.currentWO !== "—" ? t.currentWO : undefined),
    totalCompleted: t.totalCompleted ?? t.completed ?? 0,
  } as Technician;
}

export const techniciansApi = {
  list: async () => {
    const res = await apiRequest<any>("/api/v1/technicians");
    const arr = Array.isArray(res) ? res : (res?.data ?? []);
    return arr.map(normalizeTechnician) as Technician[];
  },
};

// ---------------------------------------------------------------------------
// Voice
// ---------------------------------------------------------------------------
export const voiceApi = {
  transcribe: (audioBlob: Blob, language: string) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("language", language);
    return apiRequest<{ transcription: string; language: string; extracted: any }>(
      "/api/v1/voice/transcribe",
      { method: "POST", body: formData }
    );
  },
  tts: async (text: string, language: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Request failed");
    }
    return res.blob();
  },
};
