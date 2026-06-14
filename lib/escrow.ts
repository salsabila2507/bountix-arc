/**
 * Bountix escrow constants + helpers.
 *
 * On-chain USDC escrow. Network-specific values are resolved from
 * lib/networks.ts based on the active network.
 *
 * Contract docs: /docs/escrow-contract.md
 */

import { getNetworkConfig, type NetworkConfig } from "@/lib/networks";

export function escrowConfig(slug: string): {
  escrowV0: string;
  escrowV1: string;
  escrowV2: string;
  usdc: string;
  chainId: number;
  chainIdHex: string;
} {
  const net = getNetworkConfig(slug);
  return {
    escrowV0: net.contracts.escrowV0,
    escrowV1: net.contracts.escrowV1,
    escrowV2: net.contracts.escrowV1,
    usdc: net.contracts.usdc,
    chainId: net.id,
    chainIdHex: net.chainIdHex,
  };
}

/** Default escrow contract address for the given network slug. */
export function escrowContractAddress(slug: string): string {
  return getNetworkConfig(slug).contracts.escrowV1;
}

/** USDC contract address for the given network slug. */
export function escrowUsdcAddress(slug: string): string {
  return getNetworkConfig(slug).contracts.usdc;
}

/**
 * @deprecated Base-only fallback addresses. New code must use
 * escrowContractAddress(slug), escrowUsdcAddress(slug), or
 * getNetworkConfig(slug).contracts.* to be network-agnostic.
 * These will be removed once all consumers are migrated.
 */
export const ESCROW_CONTRACT_ADDRESS = "0x81AcFAbb2D7f99fC68d764f720c731a0fA5C0995";
export const ESCROW_V1_CONTRACT_ADDRESS = "0x81AcFAbb2D7f99fC68d764f720c731a0fA5C0995";
export const ESCROW_V0_CONTRACT_ADDRESS = "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692";
export const ESCROW_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const ESCROW_CHAIN_ID = 8453;
export const ESCROW_CHAIN_ID_HEX = "0x2105";
export const ESCROW_V2_CONTRACT_ADDRESS = "0x81AcFAbb2D7f99fC68d764f720c731a0fA5C0995";

export const ESCROW_CONTRACT_VERSION = "v1";
export const ESCROW_DEFAULT_FEE_BPS = 250;
export const ESCROW_MAX_FEE_BPS = 1000;

/** Minimum escrow reward = 1 USDC (human-readable, chain-agnostic). */
export const MIN_ESCROW_USDC = 1;

/** Minimum escrow reward in base units for the given network. */
export function minEscrowUnits(networkSlug: string = "base"): bigint {
  const d = getNetworkConfig(networkSlug).usdcDecimals;
  return BigInt(MIN_ESCROW_USDC) * BigInt(10) ** BigInt(d);
}

/** Convert a human USDC amount (e.g. 50.00) to network-specific base units. */
export function usdcToUnits(amount: number, networkSlug: string = "base"): bigint {
  if (!Number.isFinite(amount) || amount < 0) return BigInt(0);
  const decimals = getNetworkConfig(networkSlug).usdcDecimals;
  const cents = Math.round(amount * 100);
  return BigInt(cents) * BigInt(10) ** BigInt(decimals - 2);
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
  {
    type: "function",
    name: "fundRaffleEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** ABI for admin-only assignWorker function. Must be called before release. */
export const ESCROW_ASSIGN_ABI = [
  {
    type: "function",
    name: "assignWorker",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "worker", type: "address" },
    ],
    outputs: [],
  },
] as const;

/** ABI for admin-only release function. Called after worker is assigned. */
export const ESCROW_RELEASE_ABI = [
  {
    type: "function",
    name: "releaseEscrow",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "bytes32" }],
    outputs: [],
  },
] as const;

/** ABI for V1 raffle winner assignment. */
export const ESCROW_ASSIGN_RAFFLE_ABI = [
  {
    type: "function",
    name: "assignRaffleWinners",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "winners", type: "address[]" },
      { name: "grossAmounts", type: "uint256[]" },
    ],
    outputs: [],
  },
] as const;

/** ABI for V1 raffle release. */
export const ESCROW_RELEASE_RAFFLE_ABI = [
  {
    type: "function",
    name: "releaseRaffleEscrow",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "bytes32" }],
    outputs: [],
  },
] as const;

/**
 * Use a task's recorded contract for release. Legacy funded tasks without a
 * recorded address predate V1 and should fall back to V0.
 */
export function escrowContractForTask(input: {
  escrowContractAddress: string | null;
  escrowTxHash: string | null;
  networkSlug?: string;
}): string {
  if (input.escrowContractAddress) return input.escrowContractAddress;
  const net = input.networkSlug ? getNetworkConfig(input.networkSlug) : null;
  if (input.escrowTxHash) return net?.contracts.escrowV0 ?? ESCROW_V0_CONTRACT_ADDRESS;
  return net?.contracts.escrowV1 ?? ESCROW_CONTRACT_ADDRESS;
}

/** Network-aware explorer tx URL helper. */
export function explorerTxUrl(slug: string, txHash: string): string {
  return `${getNetworkConfig(slug).explorerUrl}/tx/${txHash}`;
}
