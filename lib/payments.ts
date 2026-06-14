/**
 * Bountix payment constants.
 *
 * USDC-only payment token. Network-specific values are resolved from
 * lib/networks.ts based on the active network selection.
 *
 * See docs/constraints.md for the full payment + free-tier rules.
 */

export const PAYMENT_TOKEN = "USDC" as const;
export type PaymentToken = typeof PAYMENT_TOKEN;

export type PaymentStatus =
  | "unpaid"
  | "funded"
  | "released"
  | "refunded"
  | "disputed";

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  funded: "Funded (escrow)",
  released: "Released",
  refunded: "Refunded",
  disputed: "Disputed",
};

/**
 * Format a numeric USDC amount for display.
 * Always returns "<n> USDC" with thousands separator and up to 2 fraction digits.
 * Returns "0 USDC" for null/undefined/NaN.
 */
export function formatUsdc(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return `0 ${PAYMENT_TOKEN}`;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${PAYMENT_TOKEN}`;
}


