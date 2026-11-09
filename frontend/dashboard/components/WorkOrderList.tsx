"use client";

import Link from "next/link";
import { SeverityBadge, StatusBadge, type WorkOrder } from "@fieldos/shared";

/** Work order rows: a table from md up, stacked cards below md. */
export function WorkOrderList({
  items,
  showPriority = true,
}: {
  items: WorkOrder[];
  showPriority?: boolean;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">ID</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Equipment</th>
              <th scope="col" className="px-4 py-2.5 font-medium">Issue</th>
              {showPriority && <th scope="col" className="px-4 py-2.5 font-medium">Priority</th>}
              <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {items.map((wo) => (
              <tr
                key={wo.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-accent/60"
              >
                <td className="px-4 py-3 font-mono font-medium">
                  <Link href={`/work-orders/${wo.id}`} className="text-primary hover:underline">
                    {wo.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{wo.equipmentName}</td>
                <td className="max-w-[18rem] truncate px-4 py-3" title={wo.title}>
                  {wo.title}
                </td>
                {showPriority && (
                  <td className="px-4 py-3">
                    <SeverityBadge severity={wo.priority} />
                  </td>
                )}
                <td className="px-4 py-3">
                  <StatusBadge status={wo.status} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {wo.assignedToName || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {items.map((wo) => (
          <li key={wo.id}>
            <Link
              href={`/work-orders/${wo.id}`}
              className="block px-4 py-3 transition-colors hover:bg-accent/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-medium">{wo.id}</span>
                <StatusBadge status={wo.status} />
              </div>
              <p className="mt-1 text-sm font-medium">{wo.title}</p>
              <p className="text-xs text-muted-foreground">{wo.equipmentName}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                {showPriority ? <SeverityBadge severity={wo.priority} /> : <span />}
                <span>{wo.assignedToName || "Unassigned"}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
