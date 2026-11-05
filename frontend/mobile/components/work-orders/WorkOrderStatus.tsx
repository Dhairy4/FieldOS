"use client";

import { Badge } from "@fieldos/shared";

interface WorkOrderStatusProps {
  status: string;
}

const STATUS_CONFIG: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  awaiting_assignment: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

export function WorkOrderStatus({ status }: WorkOrderStatusProps) {
  return (
    <Badge className={STATUS_CONFIG[status] || STATUS_CONFIG.draft}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}