import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MessageSquareText, Sparkles } from "lucide-react";
import { PaymentBadge } from "@/components/marketplace/badges";
import { ServiceCard } from "@/components/marketplace/service-card";
import { SiteHeader } from "@/components/site-header";
import { creators, getCreator, getCreatorServices } from "@/lib/marketplace";

export function generateStaticParams() {
  return creators.map((creator) => ({ id: creator.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = getCreator(id);

  return {
    title: creator ? creator.name : "Creator",
    description: creator?.summary ?? "Bountix creator profile.",
  };
}

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = getCreator(id);

  if (!creator) {
    notFound();
  }

  const creatorServices = getCreatorServices(creator.id);

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/creators"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to creators
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-8">
            <div className="halftone-mask absolute -right-10 -top-10 h-40 w-40 opacity-20" />
            <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-[#140625] bg-[#ffdd3d] text-lg font-black text-[#140625] shadow-[5px_5px_0_#140625]">
                  {creator.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#7c3cff]">
                    {creator.handle}
                  </p>
                  <h1 className="mt-1 text-4xl font-black tracking-tight text-[#140625] sm:text-5xl">
                    {creator.name}
                  </h1>
                </div>
              </div>
              {creator.availableForEscrow ? (
                <PaymentBadge type="escrow" />
              ) : (
                <PaymentBadge type="regular" />
              )}
            </div>

            <p className="mt-8 text-xs font-black uppercase text-[#7c3cff]">
              {creator.title}
            </p>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-[#5a3b66]">
              {creator.summary}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Reputation", creator.reputation, "bg-[#38e7ff]"],
                ["Completed", creator.completedTasks, "bg-[#ffdd3d]"],
                ["Approval", creator.approvalRate, "bg-[#f1d8ff]"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className={`rounded-lg border-2 border-[#140625] p-4 shadow-[4px_4px_0_#140625] ${color}`}
                >
                  <Sparkles
                    aria-hidden="true"
                    className="h-4 w-4 text-[#7c3cff]"
                  />
                  <p className="mt-3 text-xl font-black text-[#140625]">
                    {value}
                  </p>
                  <p className="text-xs font-black uppercase text-[#5a3b66]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-black text-[#140625]">Specialties</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-lg border-2 border-[#140625] bg-white px-3 py-1.5 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625]"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-black text-[#140625]">Services</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {creatorServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
            </div>
          </article>

          <aside className="grid h-fit gap-4">
            <div className="comic-card-soft bg-white p-5">
              <h2 className="text-lg font-black text-[#140625]">
                Request a service
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                Bountix is live in gated early access. Join the waitlist for
                approval to send scope, timing, and budget.
              </p>
              <Link
                href="/waitlist"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffdd3d]"
              >
                <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                Join waitlist to request
              </Link>
            </div>

            <div className="comic-card-soft bg-[#fffaf4] p-5">
              <h2 className="text-lg font-black text-[#140625]">Profile trust</h2>
              <div className="mt-4 grid gap-3">
                {[
                  "Public reputation score",
                  "Portfolio proof",
                  "Message history",
                ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border-2 border-[#140625] bg-white p-3 text-sm font-black text-[#5a3b66] shadow-[3px_3px_0_#140625]"
                >
                  <BadgeCheck
                    aria-hidden="true"
                    className="h-4 w-4 text-[#7c3cff]"
                  />
                  {item}
                </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
