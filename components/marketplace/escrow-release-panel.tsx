"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
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
  ESCROW_ASSIGN_ABI,
  ESCROW_RELEASE_ABI,
  basescanTxUrl,
  uuidToBytes32,
} from "@/lib/escrow";
import { formatUsdc } from "@/lib/payments";
import { releaseEscrowAction } from "@/app/applications/actions";

type Phase =
  | "idle"
  | "connecting"
  | "assigning"
  | "releasing"
  | "recording"
  | "done"
  | "error";

function getProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  return eth ?? null;
}

export function EscrowReleasePanel({
  submissionId,
  taskId,
  rewardAmount,
  workerWalletAddress,
}: {
  submissionId: string;
  taskId: string;
  rewardAmount: number | null;
  workerWalletAddress: string | null;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");
  const [assignTxHash, setAssignTxHash] = useState<string>("");
  const [releaseTxHash, setReleaseTxHash] = useState<string>("");

  const busy =
    phase === "connecting" ||
    phase === "assigning" ||
    phase === "releasing" ||
    phase === "recording";

  async function handleRelease() {
    setError("");

    if (!workerWalletAddress) {
      setPhase("error");
      setError("Worker has not set a wallet address in their profile.");
      return;
    }

    const provider = getProvider();
    if (!provider) {
      setPhase("error");
      setError("No Ethereum wallet found. Install MetaMask or a Base wallet.");
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

      // Ensure wallet is on Base mainnet
      const currentChain = await walletClient.getChainId();
      if (currentChain !== base.id) {
        await walletClient.switchChain({ id: base.id });
      }

      const taskKey = uuidToBytes32(taskId);

      // Step 1: Assign worker
      setPhase("assigning");
      const assignHash = await walletClient.writeContract({
        address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_ASSIGN_ABI,
        functionName: "assignWorker",
        args: [taskKey, workerWalletAddress as `0x${string}`],
      });

      const assignReceipt = await publicClient.waitForTransactionReceipt({
        hash: assignHash,
      });
      if (assignReceipt.status !== "success") {
        throw new Error("Assign worker transaction reverted on-chain.");
      }
      setAssignTxHash(assignHash);

      // Step 2: Release escrow
      setPhase("releasing");
      const releaseHash = await walletClient.writeContract({
        address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_RELEASE_ABI,
        functionName: "releaseEscrow",
        args: [taskKey],
      });

      const releaseReceipt = await publicClient.waitForTransactionReceipt({
        hash: releaseHash,
      });
      if (releaseReceipt.status !== "success") {
        throw new Error("Release transaction reverted on-chain.");
      }
      setReleaseTxHash(releaseHash);

      // Step 3: Record both on the submission
      setPhase("recording");
      const result = await releaseEscrowAction(
        submissionId,
        assignHash,
        releaseHash,
      );
      if (!result.ok) throw new Error(result.message);

      setPhase("done");
      router.refresh();
    } catch (err) {
      setPhase("error");
      const message =
        err instanceof Error ? err.message : "Release failed. Try again.";
      setError(message.split("\n")[0].slice(0, 200));
    }
  }

  if (phase === "done") {
    return (
      <div className="mt-4 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-4 shadow-[3px_3px_0_#140625]">
        <div className="flex items-start gap-3">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 text-[#1f6b3a]"
          />
          <div>
            <h3 className="font-black text-[#140625]">Escrow released</h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#3c214b]">
              {formatUsdc(rewardAmount ?? 0)} sent to worker&apos;s wallet on Base.
            </p>
            <div className="mt-3 space-y-2">
              {assignTxHash ? (
                <a
                  href={basescanTxUrl(assignTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black text-[#7c3cff] shadow-[2px_2px_0_#140625] transition hover:bg-[#38e7ff]"
                >
                  <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  View assign tx
                </a>
              ) : null}
              {releaseTxHash ? (
                <a
                  href={basescanTxUrl(releaseTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="block inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black text-[#7c3cff] shadow-[2px_2px_0_#140625] transition hover:bg-[#38e7ff]"
                >
                  <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  View release tx
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border-2 border-[#140625] bg-[#f2e6ff] p-4 shadow-[3px_3px_0_#140625]">
      <div className="flex items-start gap-3">
        <Wallet aria-hidden="true" className="mt-0.5 h-5 w-5 text-[#7c3cff]" />
        <div className="flex-1">
          <h3 className="font-black text-[#140625]">Release escrow payment</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#3c214b]">
            Send {formatUsdc(rewardAmount ?? 0)} to the worker&apos;s wallet at{" "}
            <span className="break-all font-mono text-xs">
              {workerWalletAddress}
            </span>
          </p>

          {phase === "error" && error ? (
            <div className="mt-3 flex gap-2 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-sm font-bold text-[#8a1742]">
              <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="break-words">{error}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleRelease}
            disabled={busy}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-[#23b26d] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#1f6b3a] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
          >
            {busy ? (
              <>
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                {phase === "connecting"
                  ? "Connecting…"
                  : phase === "assigning"
                    ? "Assigning worker…"
                    : phase === "releasing"
                      ? "Releasing…"
                      : "Recording…"}
              </>
            ) : (
              <>
                <Wallet aria-hidden="true" className="h-4 w-4" />
                Release on Base
              </>
            )}
          </button>
          <p className="mt-2 text-xs font-bold text-[#5a3b66]">
            Wallet must be on Base mainnet. Two prompts: assign worker, then release.
          </p>
        </div>
      </div>
    </div>
  );
}
