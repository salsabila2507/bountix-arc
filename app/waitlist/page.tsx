import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata = {
  title: "Join Waitlist",
  description:
    "Join the Bountix waitlist for the first internet-work creators and operators.",
};

export default function WaitlistPage() {
  return (
    <main className="container-page min-h-screen py-8 text-white sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/58 transition hover:text-white"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to Bountix
      </Link>

      <section className="grid min-h-[calc(100vh-6rem)] gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-aurora-300">
            Phase 1
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Join the first operators building the future of internet work.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
            Bountix is opening with creators who need reliable execution and
            operators who want their completed work to become reputation.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 text-sm text-white/58 sm:grid-cols-3">
            <div className="rounded-lg border border-cyan-200/10 bg-white/[0.045] p-4">
              Focused task briefs
            </div>
            <div className="rounded-lg border border-cyan-200/10 bg-white/[0.045] p-4">
              Clear submissions
            </div>
            <div className="rounded-lg border border-cyan-200/10 bg-white/[0.045] p-4">
              Public reputation
            </div>
          </div>
        </div>

        <WaitlistForm />
      </section>
    </main>
  );
}
