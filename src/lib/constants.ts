export const eventStatuses = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const;
export const registrationStatuses = ["ACTIVE", "CANCELLED", "ATTENDED", "NO_SHOW"] as const;

export const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  ACTIVE: "Active",
  ATTENDED: "Attended",
  NO_SHOW: "No show",
};
