import {
  BadgeCheck,
  CircleDollarSign,
  Handshake,
  Hourglass,
  LockKeyhole,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentType, TaskType, WorkStatus } from "@/lib/marketplace";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-lg border-2 border-[#140625] px-2.5 py-1 text-xs font-black text-[#140625] shadow-[3px_3px_0_#140625]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TaskTypeBadge({ type }: { type: TaskType }) {
  return (
    <Badge className="bg-[#38e7ff]">
      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
      {type === "service" ? "Service Offer" : "Regular Task"}
    </Badge>
  );
}

export function PaymentBadge({ type }: { type: PaymentType }) {
  if (type === "escrow") {
    return (
      <Badge className="bg-[#f1d8ff]">
        <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 text-[#7c3cff]" />
        Secured Escrow
      </Badge>
    );
  }

  return (
    <Badge className="bg-white">
      <CircleDollarSign
        aria-hidden="true"
        className="h-3.5 w-3.5 text-[#23b26d]"
      />
      Manual Payment
    </Badge>
  );
}

export function StatusBadge({ status }: { status: WorkStatus }) {
  const label = {
    open: "Open",
    reviewing: "Reviewing",
    in_progress: "In Progress",
    submitted: "Submitted",
    completed: "Completed",
  }[status];

  return (
    <Badge className="bg-[#ffdd3d]">
      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5 text-[#7c3cff]" />
      {label}
    </Badge>
  );
}

export function NegotiableBadge({ negotiable }: { negotiable: boolean }) {
  if (!negotiable) {
    return null;
  }

  return (
    <Badge className="bg-[#ff4fb8] text-white">
      <Handshake aria-hidden="true" className="h-3.5 w-3.5" />
      Negotiable
    </Badge>
  );
}

export function FutureBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="bg-[#fff8ed] text-[#5a3b66]">
      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
      {children}
    </Badge>
  );
}

export function WaitlistOnlyBadge({
  variant = "waitlist",
}: {
  variant?: "waitlist" | "preview" | "early";
}) {
  if (variant === "preview") {
    return (
      <Badge className="bg-[#38e7ff]">
        <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[#7c3cff]" />
        Preview
      </Badge>
    );
  }

  if (variant === "early") {
    return (
      <Badge className="bg-[#f1d8ff]">
        <Hourglass aria-hidden="true" className="h-3.5 w-3.5 text-[#7c3cff]" />
        Early Access
      </Badge>
    );
  }

  return (
    <Badge className="bg-[#ff4fb8] text-white">
      <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
      Early Access
    </Badge>
  );
}
