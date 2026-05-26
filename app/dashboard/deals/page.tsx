import { Handshake, LockKeyhole, MessageSquareText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FutureBadge } from "@/components/marketplace/badges";

export const metadata = {
  title: "Dashboard Deals",
};

const dealSteps = [
  {
    icon: Handshake,
    title: "Negotiation",
    description: "Scope, price, and milestones are agreed before work starts.",
  },
  {
    icon: LockKeyhole,
    title: "Escrow placeholder",
    description:
      "Funds will be locked before work starts and released after approval.",
  },
  {
    icon: MessageSquareText,
    title: "Message thread",
    description:
      "Structured messages are represented in the data model without realtime chat.",
  },
];

export default function DashboardDealsPage() {
  return (
    <DashboardShell
      title="Deals"
      description="A future deal workspace for negotiations, escrow records, messages, and approval state."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {dealSteps.map((step) => (
          <div key={step.title} className="panel rounded-lg p-5">
            <step.icon aria-hidden="true" className="h-5 w-5 text-aurora-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">
              {step.description}
            </p>
            <div className="mt-5">
              <FutureBadge>Future workflow</FutureBadge>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
