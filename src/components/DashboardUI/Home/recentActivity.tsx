import React from "react";
import type { Activity, Customer } from "../../../types";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { formatTimeAgo } from "../../../utils/formatTimeAgo"; 

interface RecentActivityItemProps {
  activity: Activity;
  customers: Customer[];
  toolNameMap: { [key: string]: string };
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  activity,
  customers,
  toolNameMap,
}) => {
  const toolName = toolNameMap[activity.promptId] || activity.promptId;
  const customer = customers.find((c) => c.id === activity.customerId);
  const customerName = customer ? customer.name : "Unknown Customer";

  const description = `${toolName} run for ${customerName}`;
  const timeAgo = formatTimeAgo(activity.timestamp); 

  return (
    <li className="px-4 py-3 flex items-center">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                   flex flex-col items-center justify-center"
        >
          <IconChevronUp className="w-6 h-6 text-[var(--text-secondary)] -mb-1" />
          <IconChevronDown className="w-6 h-6 text-[var(--text-secondary)] -mt-1" />
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)] truncate">
          {description}
        </span>
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {timeAgo}
        </span>
      </div>
    </li>
  );
};

export default RecentActivityItem;
