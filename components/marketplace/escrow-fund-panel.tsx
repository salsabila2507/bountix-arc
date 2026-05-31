"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  LockKeyhole,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type EIP1193Provider,
} from "viem";
import { base } from "viem/chains";
import {
  ESCROW_CONTRACT_ADDRESS,
  ESCROW_FUND_ABI,
  ESCROW_USDC_ADDRESS,
  USDC_APPROVE_ABI,
  basescanTxUrl,
  usdcToUnits,
  uuidToBytes32,
} from "@/lib/escrow";
import { formatUsdc } from "@/lib/payments";
import { markTaskEscrowFundedAction } from "@/app/tasks/actions";

type Phase =
  | "idle"
  | "connecting"
  | "approving"
  | "funding"
  | "recording"
  | "done"
  | "error";

function getProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  return eth ?? null;
}

export function EscrowFundPanel({
  taskId,
  rewardAmount,
}: {
  taskId: string;
  rewardAmount: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const busy =
    phase === "connecting" ||
    phase === "approving" ||
    phase === "funding" ||
    phase === "recording";

  async function handleFund() {
    setError("");
    const provider = getProvider();
    if (!provider) {
      setPhase("error");
      setError("No Ethereum wallet found. Install MetaMask or a Base wallet.");
      return;
    }

    const amount = usdcToUnits(rewardAmount);
    if (amount <= BigInt(0)) {
      setPhase("error");
      setError("Reward must be a positive USDC amount.");
      return;
    }

    try {
      setPhase("connecting");
      const [account] = (await provider.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      if (!account) throw new Error("No wallet account authorised.");

      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: custom(provider),
      });
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      // Make sure the wallet is on Base mainnet.
      const currentChain = await walletClient.getChainId();
      if (currentChain !== base.id) {
        await walletClient.switchChain({ id: base.id });
      }

      const taskKey = uuidToBytes32(taskId);

      // Approve only if the current allowance is insufficient.
      const allowance = (await publicClient.readContract({
        address: ESCROW_USDC_ADDRESS as `0x${string}`,
        abi: USDC_APPROVE_ABI,
        functionName: "allowance",
        args: [account, ESCROW_CONTRACT_ADDRESS as `0x${string}`],
      })) as bigint;

      if (allowance < amount) {
        setPhase("approving");
        const approveHash = await walletClient.writeContract({
          address: ESCROW_USDC_ADDRESS as `0x${string}`,
          abi: USDC_APPROVE_ABI,
          functionName: "approve",
          args: [ESCROW_CONTRACT_ADDRESS as `0x${string}`, amount],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // Fund the escrow.
      setPhase("funding");
      const fundHash = await walletClient.writeContract({
        address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_FUND_ABI,
        functionName: "fundEscrow",
        args: [taskKey, amount],
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: fundHash,
      });
      if (receipt.status !== "success") {
        throw new Error("Funding transaction reverted on-chain.");
      }
      setTxHash(fundHash);

      // Record on the task and open it.
      setPhase("recording");
      const result = await markTaskEscrowFundedAction(taskId, fundHash);
      if (!result.ok) throw new Error(result.message);

      setPhase("done");
      router.refresh();
    } catch (err) {
      setPhase("error");
      const message =
        err instanceof Error ? err.message : "Funding failed. Try again.";
      // Wallet rejections are long and noisy — trim to the first line.
      setError(message.split("\n")[0].slice(0, 200));
    }
  }

  if (phase === "done") {
    return (
      <div className="comic-card-soft bg-[#dff7e6] p-5">
        <p className="comic-chip bg-[#1f6b3a] text-white">
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          Escrow funded
        </p>
        <h2 className="mt-4 text-lg font-black text-[#140625]">
          USDC locked on Base
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#3c214b]">
          The task is now open. Funds are held by the Bountix escrow contract
          until you release or refund.
        </p>
        {txHash ? (
          <a
            href={basescanTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#7c3cff] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            View funding tx
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="comic-card-soft bg-[#f2e6ff] p-5">
      <p className="comic-chip bg-[#7c3cff] text-white">
        <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
        Escrow USDC on Base
      </p>
      <h2 className="mt-4 text-lg font-black text-[#140625]">Fund the escrow</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#3c214b]">
        Lock <span className="font-black">{formatUsdc(rewardAmount)}</span> in
        the Bountix escrow contract. The task opens once the funding
        transaction confirms.
      </p>

      {phase === "error" && error ? (
        <div className="mt-4 flex gap-2 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-sm font-bold text-[#8a1742]">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleFund}
        disabled={busy}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-5 py-3 text-sm font-black uppercase text-white shadow-[5px_5px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
      >
        {busy ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            {phase === "connecting"
              ? "Connecting wallet…"
              : phase === "approving"
                ? "Approving USDC…"
                : phase === "funding"
                  ? "Funding escrow…"
                  : "Recording…"}
          </>
        ) : (
          <>
            <Wallet aria-hidden="true" className="h-4 w-4" />
            Connect wallet & fund
          </>
        )}
      </button>
      <p className="mt-3 text-xs font-bold text-[#5a3b66]">
        Two wallet prompts: approve USDC, then fund. Make sure your wallet is on
        Base mainnet.
      </p>
    </div>
  );
}
