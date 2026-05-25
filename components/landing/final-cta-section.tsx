import { MotionReveal } from "@/components/motion-reveal";
import { ButtonLink } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <>
      <section className="container-page py-16 sm:py-24">
        <MotionReveal>
          <div className="rounded-lg border border-acid-400/20 bg-acid-400/[0.07] p-8 text-center sm:p-12">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid-300">
              Vision
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              The reputation layer for internet work.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62">
              TaskOps begins with coordination and waitlisted operators. The
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
                Get early access as TaskOps opens its first coordination loops.
              </p>
            </div>
            <ButtonLink href="/waitlist" className="shrink-0">
              Join Waitlist
            </ButtonLink>
          </div>
        </MotionReveal>
      </section>
    </>
  );
}
