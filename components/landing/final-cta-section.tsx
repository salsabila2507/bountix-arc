import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { MotionReveal } from "@/components/motion-reveal";
import { ButtonLink } from "@/components/ui/button";

const assetBase = "/bountix-comic/bountix_assets_ready";
const telegramGroupUrl = "https://t.me/+V78fuYlQNvcxYTNl";
const xUrl = "https://x.com/bountixofc";

export function FinalCtaSection() {
  return (
    <>
      <section className="relative py-16 sm:py-24">
        <div className="container-page">
          <MotionReveal>
            <div className="comic-card relative overflow-hidden bg-[#7c3cff] p-8 text-white sm:p-12">
              <div className="halftone-mask absolute inset-0 opacity-20" />
              <Image
                src={`${assetBase}/sticker-lets-go.png`}
                alt=""
                width={156}
                height={156}
                className="absolute right-6 top-6 hidden w-32 rotate-12 object-contain drop-shadow-[5px_5px_0_#140625] md:block"
              />
              <div className="relative max-w-3xl">
                <p className="comic-chip bg-[#ffdd3d] text-[#140625]">
                  Vision
                </p>
                <h2 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
                  The community layer for trusted internet work.
                </h2>
                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/88">
                  Bountix starts with waitlisted creators and operators, then
                  grows into a marketplace where proof, payout flow, and
                  reputation stay easy to follow.
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section id="join" className="container-page scroll-mt-10 pb-24 pt-4 sm:pb-32">
        <MotionReveal>
          <div className="flex flex-col items-start justify-between gap-6 border-t-2 border-[#140625] pt-10 sm:flex-row sm:items-center">
            <div>
              <h2 className="max-w-2xl text-3xl font-black leading-tight text-[#140625] sm:text-5xl">
                Join the first operators and creators shaping Bountix.
              </h2>
              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[#5a3b66]">
                Get early access as the first task loops open.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/waitlist" className="shrink-0">
                Join Waitlist
              </ButtonLink>
              <ButtonLink
                href={telegramGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 bg-[#38e7ff] text-[#140625] hover:bg-[#ffdd3d]"
              >
                Telegram
              </ButtonLink>
            </div>
          </div>
          <footer className="mt-12 flex flex-col gap-4 border-t-2 border-[#140625] pt-6 text-sm font-bold text-[#5a3b66] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-lg font-black text-[#140625]">Bountix</span>
            <div className="flex flex-wrap gap-3">
              <a
                href={telegramGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-[#7c3cff]"
              >
                Telegram
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
              <a
                href={xUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-[#7c3cff]"
              >
                X
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
              <span>Discord soon</span>
            </div>
          </footer>
        </MotionReveal>
      </section>
    </>
  );
}
