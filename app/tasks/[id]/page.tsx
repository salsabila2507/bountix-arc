import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Users,
} from "lucide-react";
import {
  NegotiableBadge,
  PaymentBadge,
  StatusBadge,
  TaskTypeBadge,
} from "@/components/marketplace/badges";
import { SubmissionForm } from "@/components/marketplace/submission-form";
import { SiteHeader } from "@/components/site-header";
import { getTask, tasks } from "@/lib/marketplace";

export function generateStaticParams() {
  return tasks.map((task) => ({ id: task.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTask(id);

  return {
    title: task ? task.title : "Task",
    description: task?.summary ?? "Bountix task detail.",
  };
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTask(id);

  if (!task) {
    notFound();
  }

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to tasks
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-8">
            <div className="halftone-mask absolute -right-10 -top-10 h-40 w-40 opacity-20" />
            <div className="relative">
            <div className="flex flex-wrap gap-2">
              <TaskTypeBadge type="task" />
              <PaymentBadge type={task.paymentType} />
              <StatusBadge status={task.status} />
              <NegotiableBadge negotiable={task.negotiable} />
            </div>

            <p className="mt-8 text-xs font-black uppercase text-[#7c3cff]">
              {task.category}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">
              {task.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-[#5a3b66]">
              {task.summary}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {[
                ["Budget", task.budget, "bg-[#ffdd3d]"],
                ["Timeline", task.timeline, "bg-[#38e7ff]"],
                ["Applicants", String(task.applicants), "bg-white"],
                ["Submissions", String(task.submissions), "bg-[#f1d8ff]"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className={`rounded-lg border-2 border-[#140625] p-4 shadow-[4px_4px_0_#140625] ${color}`}
                >
                  <p className="text-xs font-black uppercase text-[#5a3b66]">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-black text-[#140625]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-black text-[#140625]">
                Execution brief
              </h2>
              <div className="mt-4 grid gap-4">
                {[
                  "Apply with relevant proof, timeline, and any scope questions.",
                  "Negotiate scope or price before work starts if the brief needs changes.",
                  "Submit a final delivery link with notes for review and approval.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-lg border-2 border-[#140625] bg-white p-4 text-sm font-semibold leading-6 text-[#5a3b66] shadow-[4px_4px_0_#140625]"
                  >
                    <FileText
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3cff]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-5 shadow-[5px_5px_0_#140625]">
              <div className="flex gap-3">
                <LockKeyhole
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#7c3cff]"
                />
                <div>
                  <h2 className="font-black text-[#140625]">
                    Escrow protection
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#3c214b]">
                    Funds will be locked before work starts and released after
                    approval.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </article>

          <aside className="grid h-fit gap-4">
            <div className="comic-card-soft bg-white p-5">
              <h2 className="text-lg font-black text-[#140625]">Apply to task</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                Share your approach, timeline, and proof of relevant work.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
              >
                <Users aria-hidden="true" className="h-4 w-4" />
                Start deal
              </button>
            </div>

            <div className="comic-card-soft bg-[#fffaf4] p-5">
              <h2 className="text-lg font-black text-[#140625]">
                Scope and milestones
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                Agree on price, milestones, and review notes before work begins.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-black text-[#7c3cff]">
                <MessageSquareText
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Keep scope changes clear before delivery.
              </div>
            </div>

            <SubmissionForm />
          </aside>
        </div>
      </section>
    </main>
  );
}
