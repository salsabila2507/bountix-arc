import Image from "next/image";
import { BadgeCheck, Sparkles } from "lucide-react";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { CreatorFilters } from "@/components/marketplace/filters";
import { ServiceCard } from "@/components/marketplace/service-card";
import { SiteHeader } from "@/components/site-header";
import { creators, services } from "@/lib/marketplace";

const assetBase = "/bountix-comic/bountix_assets_ready";

export const metadata = {
  title: "Browse Creators",
  description:
    "Browse Bountix creators, operators, and service offers for internet work.",
};

export default function CreatorsPage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <div className="comic-card relative overflow-hidden bg-[#fff8ed] p-5 sm:p-8">
          <div className="halftone-mask absolute inset-0 opacity-15" />
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-2 border-[#140625] bg-[#ff4fb8]/45" />
          <div className="absolute bottom-6 right-8 hidden -rotate-6 md:block">
            <Image
              src={`${assetBase}/sticker-chat-community.png`}
              alt=""
              width={120}
              height={120}
              className="h-28 w-28 object-contain drop-shadow-[5px_5px_0_#140625]"
            />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="comic-chip bg-[#ffdd3d]">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Creator marketplace
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-[#140625] sm:text-7xl">
                Creator Service Offers
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#3c214b] sm:text-xl">
                Find creators ready to help your community launch, grow, and ship.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-bold leading-6 text-[#5a3b66] sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
              {[
                ["Operators", String(creators.length)],
                ["Services", String(services.length)],
                ["Avg approval", "97%"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[4px_4px_0_#140625]"
                >
                  <p className="text-3xl font-black text-[#140625]">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase text-[#5a3b66]">
                    {label}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-4 font-black text-[#140625] shadow-[4px_4px_0_#140625] sm:col-span-3 lg:col-span-1">
                <BadgeCheck
                  aria-hidden="true"
                  className="mb-2 h-4 w-4 text-[#7c3cff]"
                />
                Profiles are built around completed work, not empty claims.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <CreatorFilters />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>

        <div className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="comic-chip bg-[#38e7ff]">
                Service offers
              </p>
              <h2 className="mt-5 text-3xl font-black text-[#140625] sm:text-5xl">
                Productized execution offers
              </h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-[#5a3b66]">
              Services are packaged work offers from creators. Request the scope,
              timing, and price that fit your next community push.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
