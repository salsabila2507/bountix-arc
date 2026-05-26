export function SubmissionForm() {
  return (
    <form className="rounded-lg border-2 border-[#140625] bg-white p-5 text-[#140625] shadow-[6px_6px_0_#140625]">
      <p className="comic-chip bg-[#38e7ff]">
        Submission
      </p>
      <h3 className="mt-4 text-xl font-black text-[#140625]">Submit proof</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#5a3b66]">
        Share the delivery link and notes the reviewer needs to approve your work.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Delivery link</span>
          <input
            type="url"
            placeholder="https://..."
            className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
          />
        </label>
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Notes</span>
          <textarea
            rows={4}
            placeholder="Summarize what changed, what is ready for review, and any constraints."
            className="mt-2 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
          />
        </label>
      </div>

      <button
        type="button"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 text-sm font-black uppercase text-white shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
      >
        Submit proof
      </button>
    </form>
  );
}
