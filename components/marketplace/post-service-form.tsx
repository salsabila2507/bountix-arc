export function PostServiceForm() {
  return (
    <form className="rounded-lg border-2 border-[#140625] bg-white p-5 text-[#140625] shadow-[8px_8px_0_#140625] sm:p-6">
      <div>
        <p className="comic-chip bg-[#ffdd3d]">
          Creator service
        </p>
        <h2 className="mt-4 text-2xl font-black text-[#140625]">
          Offer a service
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#5a3b66]">
          Creator service listings are being prepared. Task posting,
          applications, submissions, chat, and payouts are available now.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Service title</span>
          <input
            type="text"
            placeholder="Service listings are not open yet"
            className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#140625]">What you deliver</span>
          <textarea
            rows={5}
            placeholder="Production service listing tools will appear here when they are ready."
            className="mt-2 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#140625]">Starting price</span>
            <input
              type="text"
              placeholder="$350"
              className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-[#140625]">Delivery time</span>
            <input
              type="text"
              placeholder="3-5 days"
              className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-semibold text-[#140625] placeholder:text-[#5a3b66]/50 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-lg border-2 border-[#140625] bg-[#f1d8ff] p-4 shadow-[4px_4px_0_#140625]">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 border-[#140625] text-[#7c3cff] focus:ring-[#38e7ff]"
          />
          <span>
            <span className="block text-sm font-black text-[#140625]">
              Accept negotiated inquiries
            </span>
            <span className="mt-1 block text-sm font-semibold leading-6 text-[#5a3b66]">
              Service inquiries will open after production listings are ready.
            </span>
          </span>
        </label>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Service listings are being prepared"
        className="mt-6 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-5 py-3 text-sm font-black uppercase text-[#140625] shadow-[5px_5px_0_#140625] opacity-90"
      >
        Services not open yet
      </button>
    </form>
  );
}
