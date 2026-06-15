"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import type { ReactNode } from "react";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProviderBase
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "light",
          accentColor: "#7c3cff",
          logo: "/bountix-comic/bountix_assets_ready/bountix-app-icon.png",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: {
          id: 5042002,
          name: "ARC Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: {
            default: { http: ["https://rpc.testnet.arc.network"] },
          },
          blockExplorers: {
            default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
          },
        } as const,
        supportedChains: [
          {
            id: 5042002,
            name: "ARC Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://rpc.testnet.arc.network"] },
            },
            blockExplorers: {
              default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
            },
          } as const,
        ],
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
