import type { Chain } from "viem/chains";

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
  /** Path to the chain's coin/network icon, or null if none. */
  iconPath: string | null;
};

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    blockdaemon: { http: ["https://rpc.blockdaemon.testnet.arc.network"] },
    drpc: { http: ["https://rpc.drpc.testnet.arc.network"] },
    quicknode: { http: ["https://rpc.quicknode.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as Chain;

const NETWORKS: Record<string, NetworkConfig> = {
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
      escrowV0: "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692",
      escrowV1: "0x89FAF386c052B55363fdEe45B04c48fcDcb5A692",
      usdc: "0x3600000000000000000000000000000000000000",
    },
    usdcDecimals: 18,
    iconPath: null,
  },
};

export function getNetworkConfig(slug: string): NetworkConfig {
  return NETWORKS[slug] ?? NETWORKS["arc-testnet"];
}

export function getExplorerTxUrl(slug: string, txHash: string): string {
  return `${getNetworkConfig(slug).explorerUrl}/tx/${txHash}`;
}

export function getChainIcon(slug: string): string | null {
  return getNetworkConfig(slug).iconPath;
}

export const NETWORK_COOKIE = "bountix_network";

export function parseNetworkSlug(value: string | null | undefined): string {
  if (value === "arc-testnet") return value;
  return "arc-testnet";
}

export { NETWORKS };
