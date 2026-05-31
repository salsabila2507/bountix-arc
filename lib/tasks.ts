export const TASK_STATUSES = [
  "draft",
  "open",
  "in_progress",
  "submitted",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_VISIBLE_STATUSES = [
  "open",
  "in_progress",
  "submitted",
  "completed",
] as const satisfies readonly TaskStatus[];

export const TASK_TYPES = [
  "user_task",
  "official_task",
  "giveaway",
  "campaign",
  "announcement",
  "update",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const ADMIN_TASK_TYPES = [
  "official_task",
  "giveaway",
  "campaign",
  "announcement",
  "update",
] as const satisfies readonly TaskType[];

export const PAYMENT_METHODS = ["manual", "escrow_base"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  manual: "Manual payment",
  escrow_base: "Escrow USDC on Base",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  draft: "Draft",
  open: "Open",
  in_progress: "In progress",
  submitted: "Submitted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  user_task: "User task",
  official_task: "Official task",
  giveaway: "Giveaway",
  campaign: "Campaign",
  announcement: "Announcement",
  update: "Update",
};

export const TASK_TYPE_COLOR: Record<TaskType, string> = {
  user_task: "bg-[#38e7ff]",
  official_task: "bg-[#7c3cff] text-white",
  giveaway: "bg-[#ff4fb8] text-white",
  campaign: "bg-[#ffdd3d]",
  announcement: "bg-[#f0d7ff]",
  update: "bg-white",
};

export function isAdminTaskType(t: string): boolean {
  return (ADMIN_TASK_TYPES as readonly string[]).includes(t);
}

export type DbTask = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string | null;
  reward_amount: number | null;
  reward_currency: "USDC";
  chain: "base" | "base-sepolia";
  status: TaskStatus;
  task_type: TaskType;
  external_link: string | null;
  start_date: string | null;
  end_date: string | null;
  payment_method: PaymentMethod;
  escrow_contract_address: string | null;
  escrow_tx_hash: string | null;
  created_at: string;
  updated_at: string;
};

/** Lightweight column list for list views — minimises row read size. */
export const TASK_LIST_COLUMNS =
  "id, creator_id, title, description, category, reward_amount, reward_currency, chain, status, task_type, external_link, start_date, end_date, payment_method, escrow_contract_address, escrow_tx_hash, created_at, updated_at";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
