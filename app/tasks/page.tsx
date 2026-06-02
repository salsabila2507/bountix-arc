import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bolt,
  Hourglass,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TaskCard } from "@/components/marketplace/task-card";
import { DbTaskCard } from "@/components/marketplace/db-task-card";
import { CompletedWorkCard } from "@/components/marketplace/completed-work-card";
import { TaskFilters } from "@/components/marketplace/filters";
import { tasks as previewTasks } from "@/lib/marketplace";
import { completedWork } from "@/lib/completed-work";
import { createClient } from "@/lib/supabase/server";
import {
  TASK_LIST_COLUMNS,
  TASK_VISIBLE_STATUSES,
  type DbTask,
} from "@/lib/tasks";

const assetBase = "/bountix-comic/bountix_assets_ready";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks",
  description:
    "Browse tasks on the Bountix marketplace. Real tasks load from Supabase; preview examples when none are posted yet.",
};

async function fetchVisibleTasks(): Promise<DbTask[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_LIST_COLUMNS)
      .in("status", TASK_VISIBLE_STATUSES as readonly string[])
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as DbTask[];
  } catch {
    return [];
  }
}

export default async function TasksPage() {
  const dbTasks = await fetchVisibleTasks();
  const hasReal = dbTasks.length > 0;

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
              <p
                className={`comic-chip ${
                  hasReal ? "bg-[#38e7ff]" : "bg-[#ff4fb8] text-white"
                }`}
              >
                {hasReal ? (
                  <>
                    <Bolt aria-hidden="true" className="h-3.5 w-3.5" />
                    Live tasks
                  </>
                ) : (
                  <>
                    <Hourglass aria-hidden="true" className="h-3.5 w-3.5" />
                    Early access preview
                  </>
                )}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-[#140625] sm:text-7xl">
                {hasReal ? "Tasks" : "Bounty Preview"}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#3c214b] sm:text-xl">
                {hasReal
                  ? "Pick a task, deliver clean work, and earn rewards in USDC."
                  : "Bountix is live in gated early access. Approved users can create, apply, submit, and review tasks. The list below is a preview until tasks are seeded."}
              </p>
              <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#3c214b]">
                Rewards in USDC on Base. Escrow on Base coming soon.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/post-task"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 py-2 text-sm font-black uppercase text-white shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
                >
                  Post a task
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                {!hasReal ? (
                  <Link
                    href="/waitlist"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-4 py-2 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:bg-[#38e7ff]"
                  >
                    Join Waitlist
                  </Link>
                ) : null}
                <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-4 py-2 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625]">
                  <Sparkles
                    aria-hidden="true"
                    className="h-4 w-4 text-[#7c3cff]"
                  />
                  {hasReal ? "USDC rewards" : "Early Access Preview"}
                </span>
              </div>
            </div>
            <div className="grid gap-3 text-sm font-bold leading-6 text-[#5a3b66] sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
              {[
                [
                  hasReal ? "Live tasks" : "Preview tasks",
                  String(hasReal ? dbTasks.length : previewTasks.length),
                ],
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
                Escrow on Base is planned. Payments are not on-chain yet.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <TaskFilters />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {hasReal
            ? dbTasks.map((t) => <DbTaskCard key={t.id} task={t} />)
            : previewTasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>

        <div className="mt-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="comic-chip bg-[#23b26d] text-white">
                <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                Recent completed work
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#140625] sm:text-4xl">
                Recent completed work
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#3c214b]">
                Work delivered and approved across the Bountix marketplace.
                Rewards paid in USDC.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {completedWork.map((item) => (
              <CompletedWorkCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
