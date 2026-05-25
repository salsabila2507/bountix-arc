import { MotionReveal } from "@/components/motion-reveal";
import { ButtonLink } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <>
      <section className="container-page py-16 sm:py-24">
        <MotionReveal>
          <div className="rounded-lg border border-cyan-200/15 bg-[linear-gradient(135deg,rgba(156,45,255,0.16),rgba(45,136,255,0.1)_48%,rgba(56,231,255,0.12))] p-8 text-center shadow-aurora-violet sm:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-aurora-300">
              Vision
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              The reputation layer for internet work.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62">
              Bountix begins with coordination and waitlisted operators. The
              long-term goal is a trusted record of execution for every person
              doing serious work online.
            </p>
          </div>
        </MotionReveal>
      </section>

      <section id="join" className="container-page scroll-mt-10 pb-24 pt-10 sm:pb-32">
        <MotionReveal>
          <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center">
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Join the first operators building the future of internet work.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/58">
                Get early access as Bountix opens its first coordination loops.
              </p>
            </div>
            <ButtonLink href="/waitlist" className="shrink-0">
              Join Waitlist
            </ButtonLink>
          </div>
          <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-white/68">Bountix</span>
            <span>Post tasks. Earn anywhere.</span>
          </footer>
        </MotionReveal>
      </section>
    </>
  );
}
