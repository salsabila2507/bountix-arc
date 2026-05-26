import Image from "next/image";
import { LockKeyhole, Radio } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TaskCard } from "@/components/marketplace/task-card";
import { TaskFilters } from "@/components/marketplace/filters";
import { tasks } from "@/lib/marketplace";

const assetBase = "/bountix-comic/bountix_assets_ready";

export const metadata = {
  title: "Browse Tasks",
  description:
    "Browse Bountix tasks across research, growth, operations, QA, and execution work.",
};

export default function TasksPage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <div className="comic-card relative overflow-hidden bg-[#fff8ed] p-5 sm:p-8">
          <div className="halftone-mask absolute inset-0 opacity-15" />
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-2 border-[#140625] bg-[#38e7ff]/60" />
          <div className="absolute bottom-6 right-8 hidden rotate-6 md:block">
            <Image
              src={`${assetBase}/sticker-earn.png`}
              alt=""
              width={120}
              height={120}
              className="h-28 w-28 object-contain drop-shadow-[5px_5px_0_#140625]"
            />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="comic-chip bg-[#38e7ff]">
                <Radio aria-hidden="true" className="h-3.5 w-3.5" />
                Live bounty board
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-[#140625] sm:text-7xl">
                Featured Bounties
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#3c214b] sm:text-xl">
                Pick a task, submit proof, and earn rewards.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-bold leading-6 text-[#5a3b66] sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
              {[
                ["Open tasks", String(tasks.length)],
                ["Negotiable", "2"],
                ["Escrow-ready", "2"],
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
              <div className="rounded-lg border-2 border-[#140625] bg-[#f1d8ff] p-4 font-black text-[#140625] shadow-[4px_4px_0_#140625] sm:col-span-3 lg:col-span-1">
                <LockKeyhole
                  aria-hidden="true"
                  className="mb-2 h-4 w-4 text-[#7c3cff]"
                />
                Funds will be locked before work starts and released after
                approval.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <TaskFilters />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </section>
    </main>
  );
}
