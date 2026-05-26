import Link from "next/link";
import { ArrowRight, LockKeyhole, MessageSquareText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { dashboardStats } from "@/lib/marketplace";

export const metadata = {
  title: "Dashboard",
  description: "Bountix marketplace dashboard scaffold.",
};

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Marketplace overview"
      description="A unified console for posted tasks, offered services, submissions, negotiations, and future escrow records."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="panel rounded-lg p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-white/38">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel rounded-lg p-5">
          <LockKeyhole aria-hidden="true" className="h-5 w-5 text-aurora-300" />
          <h2 className="mt-4 text-xl font-semibold text-white">
            Escrow records placeholder
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Funds will be locked before work starts and released after approval.
            Smart contract escrow and wallet connection are future work.
          </p>
          <Link
            href="/dashboard/deals"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-aurora-300"
          >
            View deal flow
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="panel rounded-lg p-5">
          <MessageSquareText
            aria-hidden="true"
            className="h-5 w-5 text-aurora-300"
          />
          <h2 className="mt-4 text-xl font-semibold text-white">
            Messages placeholder
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Inquiries and negotiations are represented as structured states
            first. Realtime chat is intentionally not implemented yet.
          </p>
          <Link
            href="/dashboard/submissions"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-aurora-300"
          >
            Review submissions
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
