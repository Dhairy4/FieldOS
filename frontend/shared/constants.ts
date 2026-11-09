import type { Language, Priority, WorkOrderStatus } from "./types";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)" },
  { value: "hinglish", label: "Hinglish" },
];

export const WORK_ORDER_STATUSES: { value: WorkOrderStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-secondary text-secondary-foreground" },
  { value: "awaiting_assignment", label: "Awaiting Assignment", color: "bg-warning-soft text-warning" },
  { value: "assigned", label: "Assigned", color: "bg-info-soft text-info" },
  { value: "in_progress", label: "In Progress", color: "bg-primary/15 text-primary" },
  { value: "resolved", label: "Resolved", color: "bg-success-soft text-success" },
  { value: "closed", label: "Closed", color: "bg-secondary text-secondary-foreground" },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-success-soft text-success" },
  { value: "medium", label: "Medium", color: "bg-info-soft text-info" },
  { value: "high", label: "High", color: "bg-warning-soft text-warning" },
  { value: "critical", label: "Critical", color: "bg-danger-soft text-danger" },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const STORAGE_KEYS = {
  TOKEN: "fieldos_token",
  USER: "fieldos_user",
  LANGUAGE: "fieldos_language",
};