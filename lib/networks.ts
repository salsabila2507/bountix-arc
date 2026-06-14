import { base, type Chain } from "viem/chains";

export type NetworkConfig = {
  id: number;
  name: string;
  slug: string;
  chain: Chain;
  chainIdHex: `0x${string}`;
  explorerUrl: string;
  explorerApiUrl: string;
  rpcUrl: string;
  contracts: {
    escrowV0: `0x${string}`;
    escrowV1: `0x${string}`;
    usdc: `0x${string}`;
  };
  usdcDecimals: number;
};

const arcTestnet = {
  id: 5042002,
  name: "ARC Testnet",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as Chain;

const NETWORKS: Record<string, NetworkConfig> = {
  base: {
    id: 8453,
    name: "Base",
    slug: "base",
    chain: base,
    chainIdHex: "0x2105",
    explorerUrl: "https://basescan.org",
    explorerApiUrl: "https://api.basescan.org/api",
    rpcUrl: "https://mainnet.base.org",
    contracts: {
      escrowV0: "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692",
      escrowV1: "0x81AcFAbb2D7f99fC68d764f720c731a0fA5C0995",
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    usdcDecimals: 6,
  },
  "arc-testnet": {
    id: 5042002,
    name: "ARC Testnet",
    slug: "arc-testnet",
    chain: arcTestnet,
    chainIdHex: "0x4CE892",
    explorerUrl: "https://testnet.arcscan.app",
    explorerApiUrl: "https://api.testnet.arcscan.app/api",
    rpcUrl: "https://rpc.testnet.arc.network",
    contracts: {
      escrowV0: "0x3600000000000000000000000000000000000000",
      escrowV1: "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692",
      usdc: "0x3600000000000000000000000000000000000000",
    },
    usdcDecimals: 18,
  },
};

export function getNetworkConfig(slug: string): NetworkConfig {
  return NETWORKS[slug] ?? NETWORKS.base;
}

export function getExplorerTxUrl(slug: string, txHash: string): string {
  return `${getNetworkConfig(slug).explorerUrl}/tx/${txHash}`;
}

export const NETWORK_COOKIE = "bountix_network";

export function parseNetworkSlug(value: string | null | undefined): string {
  if (value === "base" || value === "arc-testnet") return value;
  return "base";
}

export { NETWORKS };
