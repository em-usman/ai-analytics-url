// src/utils/formatTimeAgo.ts

import type { FirebaseTimestamp } from "../types";

/**
 * Converts a Firestore timestamp or Date into a human-readable relative time string.
 * Example: "Just now", "2h ago", "5d ago", "Oct 15"
 */
export const formatTimeAgo = (
  timestamp: FirebaseTimestamp | Date | undefined
): string => {
  if (!timestamp) return "Unknown time";

  const date =
    timestamp instanceof Date
      ? timestamp
      : timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date();

  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) return "Just now";
  if (secondsPast < 3600) return `${Math.round(secondsPast / 60)}m ago`;
  if (secondsPast <= 86400) return `${Math.round(secondsPast / 3600)}h ago`;
  if (secondsPast <= 604800) return `${Math.round(secondsPast / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
