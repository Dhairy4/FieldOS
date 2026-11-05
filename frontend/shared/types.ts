export type Language = "gujarati" | "hindi" | "english" | "hinglish";

export type WorkOrderStatus =
  | "draft"
  | "awaiting_assignment"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type Priority = "low" | "medium" | "high" | "critical";

export type UserRole = "technician" | "supervisor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  languagePreference: Language;
  createdAt: string;
}

export interface Technician extends User {
  role: "technician";
  availability: "available" | "busy" | "offline";
  currentWorkOrderId?: string;
  totalCompleted: number;
}

export interface Equipment {
  id: string;
  name: string;
  machineNumber: string;
  category: "mechanical" | "electrical" | "hydraulic" | "pneumatic" | "other";
  location: string;
  lastMaintenance?: string;
}

export interface Report {
  id: string;
  workerId: string;
  workerName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentMachineNumber: string;
  issue: string;
  observation?: string;
  category: string;
  severity: Priority;
  language: Language;
  audioUrl?: string;
  transcription: string;
  missingFields: string[];
  status: WorkOrderStatus;
  workOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string; // e.g., WO-FN-001
  reportId: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}