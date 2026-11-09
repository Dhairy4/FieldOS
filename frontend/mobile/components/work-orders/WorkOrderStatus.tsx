"use client";

import { StatusBadge } from "@fieldos/shared";

interface WorkOrderStatusProps {
  status: string;
  className?: string;
}

export function WorkOrderStatus({ status, className }: WorkOrderStatusProps) {
  return <StatusBadge status={status} className={className} />;
}