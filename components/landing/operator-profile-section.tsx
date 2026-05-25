import { BadgeCheck, CheckCircle2, Gauge, Layers3, ShieldCheck } from "lucide-react";
import { MotionReveal } from "@/components/motion-reveal";

const stats = [
  { label: "Reputation", value: "842", icon: Gauge },
  { label: "Completed", value: "67", icon: CheckCircle2 },
  { label: "Approval", value: "98%", icon: BadgeCheck },
];

const specialties = ["Research", "Ops", "Growth Systems", "QA"];

function OperatorProfileCard() {
  return (
    <div className="panel rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">
            Operator profile
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white">Nova Park</h3>
          <p className="mt-1 text-sm text-white/58">
            Verified execution record across internet-native teams.
          </p>
        </div>
        <div className="rounded-md border border-acid-400/25 bg-acid-400/10 p-2 text-acid-300">
          <Layers3 aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-md border border-white/10 bg-graphite-950/70 p-3"
          >
            <Icon aria-hidden="true" className="h-4 w-4 text-acid-400" />
            <p className="mt-3 text-lg font-semibold text-white">{value}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-white/42">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">
          Specialties
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-medium text-white/76"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OperatorProfileSection() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <MotionReveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid-300">
            Operator profile preview
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Execution history should be portable.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
            TaskOps profiles turn completed tasks into a visible record:
            scores, approvals, specialties, and the work trail behind them.
          </p>
          <div className="mt-7 flex items-center gap-3 text-sm text-white/58">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-acid-400" />
            Reputation grows from accepted work, not self-written claims.
          </div>
        </MotionReveal>
        <MotionReveal delay={0.12}>
          <OperatorProfileCard />
        </MotionReveal>
      </div>
    </section>
  );
}
