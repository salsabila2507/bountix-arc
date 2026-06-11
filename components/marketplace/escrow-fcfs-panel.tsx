"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
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
  ESCROW_V2_CONTRACT_ADDRESS,
  ESCROW_V2_PAY_WINNERS_ABI,
  ESCROW_V2_REFUND_FCFS_ABI,
  ESCROW_V2_GET_FCFS_ABI,
  ESCROW_USDC_ADDRESS,
  USDC_APPROVE_ABI,
  basescanTxUrl,
  usdcToUnits,
  uuidToBytes32,
} from "@/lib/escrow";
import { formatUsdc } from "@/lib/payments";
import {
  DEFAULT_LOCALE,
  createTranslator,
  type Locale,
} from "@/lib/i18n";

type Phase = "idle" | "connecting" | "paying" | "refunding" | "recording" | "done" | "error";

function getProvider(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  return eth ?? null;
}

export function EscrowFcfsPayPanel({
  taskId,
  submissionId,
  rewardPerWinner,
  workerWalletAddress,
  workerLabel,
  locale = DEFAULT_LOCALE,
}: {
  taskId: string;
  submissionId: string;
  rewardPerWinner: number;
  workerWalletAddress: string | null;
  workerLabel: string;
  locale?: Locale;
}) {
  const t = createTranslator(locale);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const busy = phase === "connecting" || phase === "paying" || phase === "recording";

  async function handlePay() {
    setError("");
    const provider = getProvider();
    if (!provider) {
      setPhase("error");
      setError(t("payment.walletNoWallet"));
      return;
    }

    if (!workerWalletAddress) {
      setPhase("error");
      setError(t("escrow.release.noWorkerWallet"));
      return;
    }

    try {
      setPhase("connecting");
      const [account] = (await provider.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      if (!account) throw new Error(t("payment.walletNoAccount"));

      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: custom(provider),
      });
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const currentChain = await walletClient.getChainId();
      if (currentChain !== base.id) {
        await walletClient.switchChain({ id: base.id });
      }

      const taskKey = uuidToBytes32(taskId);

      setPhase("paying");
      const payHash = await walletClient.writeContract({
        address: ESCROW_V2_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_V2_PAY_WINNERS_ABI,
        functionName: "payWinners",
        args: [taskKey, [workerWalletAddress as `0x${string}`]],
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: payHash,
      });
      if (receipt.status !== "success") {
        throw new Error(t("escrow.fcfs.payoutReverted"));
      }
      setTxHash(payHash);

      // Record payout on submission
      setPhase("recording");
      const { payFCFSWinnerAction } = await import("@/app/applications/actions");
      const result = await payFCFSWinnerAction(submissionId, payHash);
      if (!result.ok) throw new Error(result.message);

      setPhase("done");
      router.refresh();
    } catch (err) {
      setPhase("error");
      const message =
        err instanceof Error ? err.message : t("escrow.fund.failed");
      setError(message.split("\n")[0].slice(0, 200));
    }
  }

  if (phase === "done") {
    return (
      <div className="mt-4 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-3 text-sm font-bold text-[#1f6b3a]">
        <p className="font-black">{t("escrow.fcfs.payoutDoneTitle")}</p>
        <p className="mt-1">
          {t("escrow.fcfs.payoutDoneBody", {
            reward: formatUsdc(rewardPerWinner),
          })}
        </p>
        {txHash ? (
          <a
            href={basescanTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#7c3cff] hover:underline"
          >
            <ExternalLink aria-hidden="true" className="h-3 w-3" />
            {t("escrow.fcfs.viewPayoutTx")}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-black text-[#140625]">
        {t("escrow.fcfs.payoutTitle")}
      </h3>
      <p className="mt-1 text-xs font-semibold text-[#5a3b66]">
        {t("escrow.fcfs.payoutBody", {
          reward: formatUsdc(rewardPerWinner),
        })}{" "}
        {workerWalletAddress ?? workerLabel}
      </p>

      {phase === "error" && error ? (
        <div className="mt-3 flex gap-2 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-xs font-bold text-[#8a1742]">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
      >
        {busy ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-3 w-3 animate-spin" />
            {phase === "connecting"
              ? t("escrow.fund.connecting")
              : phase === "paying"
                ? "Paying..."
                : t("escrow.fund.recording")}
          </>
        ) : (
          <>
            <Wallet aria-hidden="true" className="h-4 w-4" />
            {t("escrow.fcfs.payoutButton")}
          </>
        )}
      </button>
      <p className="mt-2 text-[0.65rem] font-bold text-[#5a3b66]">
        {t("escrow.fcfs.payoutPrompts")}
      </p>
    </div>
  );
}

export function EscrowFcfsRefundPanel({
  taskId,
  locale = DEFAULT_LOCALE,
}: {
  taskId: string;
  locale?: Locale;
}) {
  const t = createTranslator(locale);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const busy = phase === "connecting" || phase === "refunding" || phase === "recording";

  async function handleRefund() {
    setError("");
    const provider = getProvider();
    if (!provider) {
      setPhase("error");
      setError(t("payment.walletNoWallet"));
      return;
    }

    try {
      setPhase("connecting");
      const [account] = (await provider.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      if (!account) throw new Error(t("payment.walletNoAccount"));

      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: custom(provider),
      });
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const currentChain = await walletClient.getChainId();
      if (currentChain !== base.id) {
        await walletClient.switchChain({ id: base.id });
      }

      const taskKey = uuidToBytes32(taskId);

      setPhase("refunding");
      const refundHash = await walletClient.writeContract({
        address: ESCROW_V2_CONTRACT_ADDRESS as `0x${string}`,
        abi: ESCROW_V2_REFUND_FCFS_ABI,
        functionName: "refundFCFSEscrow",
        args: [taskKey],
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: refundHash,
      });
      if (receipt.status !== "success") {
        throw new Error("Refund transaction reverted on-chain.");
      }
      setTxHash(refundHash);

      setPhase("recording");
      const { refundFCFSEscrowAction } = await import("@/app/tasks/actions");
      const result = await refundFCFSEscrowAction(taskId, refundHash);
      if (!result.ok) throw new Error(result.message);

      setPhase("done");
      router.refresh();
    } catch (err) {
      setPhase("error");
      const message =
        err instanceof Error ? err.message : "Refund failed.";
      setError(message.split("\n")[0].slice(0, 200));
    }
  }

  if (phase === "done") {
    return (
      <div className="mt-3 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-3 text-sm font-bold text-[#1f6b3a]">
        <p className="font-black">{t("escrow.fcfs.refundDoneTitle")}</p>
        <p className="mt-1">{t("escrow.fcfs.refundDoneBody")}</p>
        {txHash ? (
          <a
            href={basescanTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#7c3cff] hover:underline"
          >
            <ExternalLink aria-hidden="true" className="h-3 w-3" />
            {t("escrow.viewFundingTx")}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-[#140625] bg-[#fffaf4] p-3">
      <h3 className="text-sm font-black text-[#140625]">
        {t("escrow.fcfs.refundTitle")}
      </h3>
      <p className="mt-1 text-xs font-semibold text-[#5a3b66]">
        {t("escrow.fcfs.refundBody")}
      </p>

      {phase === "error" && error ? (
        <div className="mt-3 flex gap-2 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-xs font-bold text-[#8a1742]">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleRefund}
        disabled={busy}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-4 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffdd3d] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
      >
        {busy ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-3 w-3 animate-spin" />
            {phase === "connecting"
              ? t("escrow.fund.connecting")
              : phase === "refunding"
                ? "Refunding..."
                : t("escrow.fund.recording")}
          </>
        ) : (
          <>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            {t("escrow.fcfs.refundButton")}
          </>
        )}
      </button>
      <p className="mt-2 text-[0.65rem] font-bold text-[#5a3b66]">
        {t("escrow.fcfs.refundPrompts")}
      </p>
    </div>
  );
}
