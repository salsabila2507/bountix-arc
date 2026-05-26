import Image from "next/image";
import { Clock3, MessageSquareText } from "lucide-react";
import {
  NegotiableBadge,
  PaymentBadge,
  TaskTypeBadge,
} from "@/components/marketplace/badges";
import type { Service } from "@/lib/marketplace";

const assetBase = "/bountix-comic/bountix_assets_ready";

const categoryIcons: Record<string, string> = {
  Research: `${assetBase}/icon-writing.png`,
  Growth: `${assetBase}/icon-marketing.png`,
  "Design QA": `${assetBase}/icon-design.png`,
};

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const icon =
    categoryIcons[service.category] ?? `${assetBase}/icon-community.png`;

  return (
    <article className="group relative overflow-hidden rounded-lg border-2 border-[#140625] bg-white p-5 text-[#140625] shadow-[7px_7px_0_#140625] transition duration-200 hover:-translate-y-1 hover:bg-[#fff8ed]">
      <span
        aria-hidden="true"
        className="halftone-mask absolute -right-8 -top-8 h-28 w-28 opacity-20"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-3 w-full bg-[#ff4fb8]"
      />
      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <TaskTypeBadge type="service" />
          <PaymentBadge type={service.paymentType} />
          <NegotiableBadge negotiable={service.negotiable} />
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Image
              src={icon}
              alt=""
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div>
              <p className="text-xs font-black uppercase text-[#7c3cff]">
                {service.category}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-[#140625]">
                {service.title}
              </h3>
            </div>
          </div>
          <p className="shrink-0 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625]">
            {service.startingAt}
          </p>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-[#5a3b66]">
          {service.summary}
        </p>
        <div className="mt-5 flex flex-col gap-3 border-t-2 border-dashed border-[#140625]/30 pt-4 text-sm font-black text-[#5a3b66] sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
            {service.delivery}
          </span>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5"
          >
            <MessageSquareText
              aria-hidden="true"
              className="h-4 w-4 text-[#7c3cff]"
            />
            Request service
          </button>
        </div>
      </div>
    </article>
  );
}
