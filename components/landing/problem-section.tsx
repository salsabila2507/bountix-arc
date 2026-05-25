import { MotionReveal } from "@/components/motion-reveal";

const problemItems = [
  "Work starts in Discord, continues in DMs, and gets tracked in someone else's spreadsheet.",
  "Creators cannot tell who actually executes until the work is already late.",
  "Operators complete valuable work, then lose the proof inside private threads.",
];

export function ProblemSection() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <MotionReveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-aurora-300">
            The problem
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            The internet already has the talent. It lacks the operating layer.
          </h2>
        </MotionReveal>
        <MotionReveal delay={0.08}>
          <p className="text-base leading-8 text-white/62">
            The current workflow is scattered across chat rooms, private
            messages, spreadsheets, and fragile trust. Bountix starts by making
            work easier to define, review, and remember.
          </p>
        </MotionReveal>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {problemItems.map((item, index) => (
          <MotionReveal key={item} delay={index * 0.06}>
            <div className="panel h-full rounded-lg p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] text-white/60">
                0{index + 1}
              </div>
              <p className="mt-5 text-sm leading-6 text-white/66">{item}</p>
            </div>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
