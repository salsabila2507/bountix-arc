import { CircleDot } from "lucide-react";
import { CoordinationField } from "@/components/landing/coordination-field";
import { MotionReveal } from "@/components/motion-reveal";
import { ButtonLink } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      id="top"
      className="container-page relative flex min-h-[calc(100vh-5rem)] items-center pb-20 pt-10 sm:pb-24 lg:pt-0"
    >
      <CoordinationField />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <MotionReveal>
          <p className="mx-auto inline-flex rounded-md border border-cyan-200/15 bg-white/[0.055] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-aurora-300">
            Bountix for internet work
          </p>
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Internet work needs better coordination.
          </h1>
        </MotionReveal>

        <MotionReveal delay={0.14}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
            Post tasks. Prove execution. Earn anywhere.
          </p>
        </MotionReveal>

        <MotionReveal delay={0.2}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/waitlist">Join Waitlist</ButtonLink>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <CircleDot aria-hidden="true" className="h-4 w-4 text-aurora-400" />
              Phase 1 opens with a focused operator waitlist
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
