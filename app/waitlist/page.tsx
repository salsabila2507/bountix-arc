import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

const assetBase = "/bountix-comic/bountix_assets_ready";

export const metadata = {
  title: "Join Waitlist",
  description:
    "Join the Bountix waitlist for the first internet-work creators and operators.",
};

export default function WaitlistPage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <div className="container-page py-8 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Bountix
        </Link>

        <section className="grid min-h-[calc(100vh-6rem)] gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="comic-chip bg-[#ffdd3d]">Phase 1</p>
            <div className="mt-6 flex items-center gap-4">
              <Image
                src={`${assetBase}/bountix-app-icon.png`}
                alt=""
                width={96}
                height={96}
                priority
                className="h-20 w-20 rounded-lg border-2 border-[#140625] object-cover shadow-[5px_5px_0_#140625]"
              />
              <div className="speech-bubble bg-white px-4 py-3 text-sm font-black uppercase text-[#140625]">
                Community tasks, clean proof.
              </div>
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">
              Join the first builders shaping the Bountix task marketplace.
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-[#3c214b]">
              Bountix is opening with creators who need reliable execution and
              operators who want completed work to become public reputation.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 text-sm font-black text-[#140625] sm:grid-cols-3">
              <div className="comic-card-soft bg-[#38e7ff] p-4">
                Focused task briefs
              </div>
              <div className="comic-card-soft bg-[#ffdd3d] p-4">
                Clear submissions
              </div>
              <div className="comic-card-soft bg-[#f2e6ff] p-4">
                Portable reputation
              </div>
            </div>

            <div className="mt-6 max-w-xl rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[5px_5px_0_#140625]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-[#140625] bg-[#0d3a86] text-white shadow-[3px_3px_0_#140625]">
                  <Coins aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black uppercase leading-tight text-[#140625]">
                    Interested in USDC payments on Base?
                  </p>
                  <p className="mt-2 text-xs font-bold leading-6 text-[#3c214b]">
                    Join the waitlist to follow Bountix&apos;s path toward
                    Base-powered task rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <WaitlistForm />
        </section>
      </div>
    </main>
  );
}
