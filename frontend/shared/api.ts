import { User, WorkOrder, Report, PaginatedResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("fieldos_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// Auth
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

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: (data: LoginCredentials) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: RegisterData) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Reports
export const reportApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<PaginatedResponse<Report>>(`/reports?${qs}`);
  },
  get: (id: string) => apiRequest<Report>(`/reports/${id}`),
  create: (data: {
    equipmentId: string;
    issue: string;
    observation?: string;
    language: string;
    audioUrl?: string;
    transcription: string;
  }) =>
    apiRequest<Report>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Work Orders
export const workOrderApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<PaginatedResponse<WorkOrder>>(`/work-orders?${qs}`);
  },
  get: (id: string) => apiRequest<WorkOrder>(`/work-orders/${id}`),
  assign: (id: string, technicianId: string) =>
    apiRequest<WorkOrder>(`/work-orders/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ technicianId }),
    }),
  updateStatus: (id: string, status: string) =>
    apiRequest<WorkOrder>(`/work-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Voice
export const voiceApi = {
  transcribe: (audioBlob: Blob, language: string) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("language", language);
    return apiRequest<{ transcription: string; language: string }>("/voice/transcribe", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },
};
