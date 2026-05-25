import { ArrowRight } from "lucide-react";
import { MotionReveal } from "@/components/motion-reveal";

const steps = [
  {
    title: "Create a task",
    description:
      "Publish a focused brief with scope, proof requirements, and completion criteria.",
  },
  {
    title: "Submit work",
    description:
      "Operators attach the actual deliverable and context needed for review.",
  },
  {
    title: "Build reputation",
    description:
      "Accepted work compounds into a public execution record that travels with the operator.",
  },
];

export function SolutionSection() {
  return (
    <section className="container-page py-16 sm:py-24">
      <MotionReveal className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-acid-300">
          The solution
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          A simple loop for verified internet work.
        </h2>
      </MotionReveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <MotionReveal key={step.title} delay={index * 0.08}>
            <div className="panel h-full rounded-lg p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-acid-400/25 bg-acid-400/10 text-sm font-semibold text-acid-300">
                  {index + 1}
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-white/35" />
              </div>
              <h3 className="mt-7 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">
                {step.description}
              </p>
            </div>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
