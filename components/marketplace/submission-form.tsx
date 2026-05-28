import Link from "next/link";
import { Hourglass } from "lucide-react";

export function SubmissionForm() {
  return (
    <div className="rounded-lg border-2 border-[#140625] bg-white p-5 text-[#140625] shadow-[6px_6px_0_#140625]">
      <p className="comic-chip bg-[#38e7ff]">
        Submission preview
      </p>
      <h3 className="mt-4 text-xl font-black text-[#140625]">
        Proof submission unlocks at launch
      </h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#5a3b66]">
        This is a preview of how operators will share delivery links and notes
        for review. Submissions open once Bountix exits early access.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Delivery link</span>
          <input
            type="url"
            placeholder="https://..."
            disabled
            aria-disabled="true"
            className="mt-2 h-12 w-full cursor-not-allowed rounded-lg border-2 border-dashed border-[#140625]/50 bg-[#fffaf4] px-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Notes</span>
          <textarea
            rows={4}
            placeholder="Summarize what changed, what is ready for review, and any constraints."
            disabled
            aria-disabled="true"
            className="mt-2 w-full cursor-not-allowed rounded-lg border-2 border-dashed border-[#140625]/50 bg-[#fffaf4] px-3 py-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Bountix is in waitlist-only preview"
        className="mt-5 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#f1d8ff] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] opacity-90"
      >
        <Hourglass aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
        Early access only
      </button>

      <Link
        href="/waitlist"
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 text-sm font-black uppercase text-white shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
      >
        Join waitlist for access
      </Link>
    </div>
  );
}
