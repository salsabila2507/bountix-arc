import Image from "next/image";
import { BadgeCheck, Clock3, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/marketplace/empty-state";
import { createTranslator } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

const assetBase = "/bountix-comic/bountix_assets_ready";

type PublishedService = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  starting_amount: number | null;
  starting_currency: string | null;
  delivery_time: string | null;
  payment_type: "regular" | "escrow";
  negotiable: boolean;
};

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creator Services",
  description:
    "Creator services on Bountix. Production service listings appear here when available.",
};

async function fetchPublishedServices(): Promise<PublishedService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, title, description, category, starting_amount, starting_currency, delivery_time, payment_type, negotiable",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error || !data) return [];
    return data as PublishedService[];
  } catch {
    return [];
  }
}

function formatStartingAt(service: PublishedService, customLabel: string) {
  if (service.starting_amount === null) return customLabel;
  return `${service.starting_amount} ${service.starting_currency ?? "USDC"}`;
}

function ServiceListingCard({
  service,
  labels,
}: {
  service: PublishedService;
  labels: {
    service: string;
    escrowAvailable: string;
    manualPayment: string;
    negotiable: string;
    categoryFallback: string;
    customPrice: string;
  };
}) {
  return (
    <article className="relative overflow-hidden rounded-lg border-2 border-[#140625] bg-white p-5 text-[#140625] shadow-[7px_7px_0_#140625]">
      <span
        aria-hidden="true"
        className="halftone-mask absolute -right-8 -top-8 h-28 w-28 opacity-20"
      />
      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-2.5 py-1 text-xs font-black text-[#140625] shadow-[3px_3px_0_#140625]">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            {labels.service}
          </span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-white px-2.5 py-1 text-xs font-black text-[#140625] shadow-[3px_3px_0_#140625]">
            {service.payment_type === "escrow"
              ? labels.escrowAvailable
              : labels.manualPayment}
          </span>
          {service.negotiable ? (
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-2.5 py-1 text-xs font-black text-[#140625] shadow-[3px_3px_0_#140625]">
              {labels.negotiable}
            </span>
          ) : null}
        </div>

        <p className="mt-5 text-xs font-black uppercase text-[#7c3cff]">
          {service.category ?? labels.categoryFallback}
        </p>
        <h2 className="mt-2 text-xl font-black leading-tight text-[#140625]">
          {service.title}
        </h2>
        <p className="mt-4 line-clamp-4 text-sm font-semibold leading-6 text-[#5a3b66]">
          {service.description}
        </p>

        <div className="mt-5 flex flex-col gap-3 border-t-2 border-dashed border-[#140625]/30 pt-4 text-sm font-black text-[#5a3b66] sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-[#140625] shadow-[3px_3px_0_#140625]">
            {formatStartingAt(service, labels.customPrice)}
          </span>
          {service.delivery_time ? (
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
              {service.delivery_time}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function CreatorsPage() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const services = await fetchPublishedServices();
  const hasServices = services.length > 0;
  const cardLabels = {
    service: t("creators.card.service"),
    escrowAvailable: t("creators.card.escrowAvailable"),
    manualPayment: t("payment.manual"),
    negotiable: t("market.badge.negotiable"),
    categoryFallback: t("creators.card.categoryFallback"),
    customPrice: t("creators.card.customPrice"),
  };

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
                {t("creators.chip")}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-[#140625] sm:text-7xl">
                {hasServices
                  ? t("creators.titleLive")
                  : t("creators.titlePreparing")}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#3c214b] sm:text-xl">
                {hasServices
                  ? t("creators.bodyLive")
                  : t("creators.bodyPreparing")}
              </p>
            </div>
            <div className="grid gap-3 text-sm font-bold leading-6 text-[#5a3b66] sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
              {[
                [t("creators.stat.published"), String(services.length)],
                [
                  t("creators.stat.profiles"),
                  hasServices
                    ? t("creators.stat.liveRecords")
                    : t("creators.stat.preparing"),
                ],
                [t("creators.stat.inquiry"), t("creators.stat.notOpen")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[4px_4px_0_#140625]"
                >
                  <p className="text-2xl font-black text-[#140625]">{value}</p>
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
                {t("creators.noPlaceholders")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {hasServices ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceListingCard
                  key={service.id}
                  service={service}
                  labels={cardLabels}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("creators.emptyTitle")}
              description={t("creators.emptyBody")}
            />
          )}
        </div>
      </section>
    </main>
  );
}
