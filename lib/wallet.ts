import { createPublicClient, createWalletClient, custom, http, type EIP1193Provider } from "viem";
import { getNetworkConfig, type NetworkConfig } from "./networks";

export type WalletInfo = {
  provider: EIP1193Provider;
  isArcWallet: boolean;
};

export function detectWallet(): WalletInfo | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    __arcWallet?: EIP1193Provider & {
      connect: () => Promise<`0x${string}`[]>;
      switchChain: (chainId: number) => Promise<void>;
      disconnect: () => Promise<void>;
      ARC_TESTNET_CHAIN_ID?: number;
    };
    ethereum?: EIP1193Provider;
  };
  if (w.__arcWallet) {
    return { provider: w.__arcWallet as unknown as EIP1193Provider, isArcWallet: true };
  }
  if (w.ethereum) {
    return { provider: w.ethereum, isArcWallet: false };
  }
  return null;
}

export type ConnectedWallet = {
  provider: EIP1193Provider;
  account: `0x${string}`;
  netCfg: NetworkConfig;
  walletClient: ReturnType<typeof createWalletClient>;
  publicClient: ReturnType<typeof createPublicClient>;
  isArcWallet: boolean;
};

export async function connectWallet(
  networkSlug: string,
): Promise<ConnectedWallet> {
  const wallet = detectWallet();
  if (!wallet) {
    throw new Error("No wallet found");
  }

  const netCfg = getNetworkConfig(networkSlug);

  let account: `0x${string}`;
  if (wallet.isArcWallet) {
    const accounts = await (wallet.provider as unknown as {
      connect: () => Promise<`0x${string}`[]>;
    }).connect();
    if (!accounts || accounts.length === 0) {
      throw new Error("No account returned from ARC Wallet");
    }
    account = accounts[0];
    await (wallet.provider as unknown as {
      switchChain: (chainId: number) => Promise<void>;
    }).switchChain(netCfg.id);
  } else {
    const accounts = (await wallet.provider.request({
      method: "eth_requestAccounts",
    })) as `0x${string}`[];
    if (!accounts || accounts.length === 0) {
      throw new Error("No account returned");
    }
    account = accounts[0];
  }

  const walletClient = createWalletClient({
    account,
    chain: netCfg.chain,
    transport: custom(wallet.provider),
  });

  const publicClient = createPublicClient({
    chain: netCfg.chain,
    transport: http(),
  });

  if (!wallet.isArcWallet) {
    const currentChain = await walletClient.getChainId();
    if (currentChain !== netCfg.id) {
      await walletClient.switchChain({ id: netCfg.id });
    }
  }

  return {
    provider: wallet.provider,
    account,
    netCfg,
    walletClient,
    publicClient,
    isArcWallet: wallet.isArcWallet,
  };
}

export async function disconnectWallet(wallet: WalletInfo): Promise<void> {
  if (wallet.isArcWallet) {
    try {
      await (wallet.provider as unknown as {
        disconnect: () => Promise<void>;
      }).disconnect();
    } catch {
      // ARC Wallet disconnect may fail if already disconnected
    }
    return;
  }
  try {
    await wallet.provider.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch {
    // Not all wallets support revokePermissions
  }
}
