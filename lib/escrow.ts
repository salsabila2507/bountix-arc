/**
 * Bountix escrow (BountixEscrowV0) constants + helpers.
 *
 * On-chain USDC escrow on Base mainnet. Optional payment path — manual
 * payment remains the default and does not touch any of this.
 *
 * Contract docs: /docs/escrow-contract.md
 * Reuses the shared payment constants in /lib/payments.ts.
 */

import {
  BASE_MAINNET_CHAIN_ID,
  BASE_MAINNET_USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/payments";

/** Deployed BountixEscrowV0 on Base mainnet. */
export const ESCROW_CONTRACT_ADDRESS =
  "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692";

export const ESCROW_USDC_ADDRESS = BASE_MAINNET_USDC_ADDRESS;
export const ESCROW_CHAIN_ID = BASE_MAINNET_CHAIN_ID;

/** Base mainnet chainId as the 0x-hex string used by EIP-1193 wallets. */
export const ESCROW_CHAIN_ID_HEX = `0x${BASE_MAINNET_CHAIN_ID.toString(16)}`;

/** Minimum escrow reward = 1 USDC, in base units (6 decimals). */
export const MIN_ESCROW_USDC = 1;
export const MIN_ESCROW_UNITS = BigInt(1_000_000);

/** Convert a human USDC amount (e.g. 50.00) to 6-decimal base units. */
export function usdcToUnits(amount: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) return BigInt(0);
  // Round to the cent first to avoid float dust, then scale to 6 decimals.
  const cents = Math.round(amount * 100);
  return BigInt(cents) * BigInt(10) ** BigInt(USDC_DECIMALS - 2);
}

/**
 * Map a task UUID to the bytes32 taskId the contract keys escrows by.
 * A UUID is 16 bytes; we right-pad with zeros to 32 bytes. Deterministic
 * and collision-free across distinct UUIDs.
 */
export function uuidToBytes32(uuid: string): `0x${string}` {
  const hex = uuid.replace(/-/g, "").toLowerCase();
  if (hex.length !== 32 || /[^0-9a-f]/.test(hex)) {
    throw new Error(`Invalid task UUID for escrow: ${uuid}`);
  }
  return `0x${hex.padEnd(64, "0")}` as `0x${string}`;
}

/** Minimal ABI fragments needed for the approve + fund flow (viem-compatible). */
export const USDC_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const ESCROW_FUND_ABI = [
  {
    type: "function",
    name: "fundEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** Basescan tx URL helper for surfacing the funding receipt. */
export function basescanTxUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}
