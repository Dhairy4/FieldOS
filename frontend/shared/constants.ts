import type { Language, Priority, WorkOrderStatus } from "./types";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)" },
  { value: "hinglish", label: "Hinglish" },
];

export const WORK_ORDER_STATUSES: { value: WorkOrderStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
  { value: "awaiting_assignment", label: "Awaiting Assignment", color: "bg-blue-100 text-blue-800" },
  { value: "assigned", label: "Assigned", color: "bg-purple-100 text-purple-800" },
  { value: "in_progress", label: "In Progress", color: "bg-orange-100 text-orange-800" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const STORAGE_KEYS = {
  TOKEN: "fieldos_token",
  USER: "fieldos_user",
  LANGUAGE: "fieldos_language",
};