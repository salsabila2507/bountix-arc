import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  ExternalLink,
  FileText,
  LockKeyhole,
  Users,
} from "lucide-react";
import {
  NegotiableBadge,
  PaymentBadge,
  StatusBadge,
  TaskTypeBadge,
  WaitlistOnlyBadge,
} from "@/components/marketplace/badges";
import { SubmissionForm } from "@/components/marketplace/submission-form";
import { ApplyForm } from "@/components/marketplace/apply-form";
import { SubmitWorkForm } from "@/components/marketplace/submit-work-form";
import { EscrowFundPanel } from "@/components/marketplace/escrow-fund-panel";
import { SiteHeader } from "@/components/site-header";
import { withdrawApplicationAction } from "@/app/applications/actions";
import { getTask, tasks as previewTasks } from "@/lib/marketplace";
import { createClient } from "@/lib/supabase/server";
import { formatUsdc } from "@/lib/payments";
import {
  TASK_LIST_COLUMNS,
  TASK_STATUS_LABEL,
  TASK_TYPE_COLOR,
  TASK_TYPE_LABEL,
  isUuid,
  type DbTask,
} from "@/lib/tasks";
import {
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_LABEL,
  SUBMISSION_STATUS_COLOR,
  SUBMISSION_STATUS_LABEL,
  type DbApplication,
  type DbSubmission,
} from "@/lib/applications";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

async function fetchDbTask(id: string): Promise<DbTask | null> {
  if (!isUuid(id)) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_LIST_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as DbTask;
  } catch {
    return null;
  }
}

async function loadActorContext(taskId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        userId: null as string | null,
        isAdmin: false,
        canUse: false,
        ownApplication: null as DbApplication | null,
        ownSubmissions: [] as DbSubmission[],
        applicantCounts: { pending: 0, accepted: 0 },
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, can_use_platform")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const canUse = (profile?.can_use_platform ?? false) || isAdmin;

    const { data: app } = await supabase
      .from("task_applications")
      .select("id, task_id, applicant_id, message, status, created_at, updated_at")
      .eq("task_id", taskId)
      .eq("applicant_id", user.id)
      .maybeSingle();

    let ownSubmissions: DbSubmission[] = [];
    if (app?.id) {
      const { data: subs } = await supabase
        .from("task_submissions")
        .select(
          "id, task_id, application_id, submitter_id, delivery_url, notes, review_notes, status, reviewed_at, created_at, updated_at",
        )
        .eq("application_id", app.id)
        .order("created_at", { ascending: false });
      ownSubmissions = (subs ?? []) as DbSubmission[];
    }

    return {
      userId: user.id,
      isAdmin,
      canUse,
      ownApplication: (app as DbApplication | null) ?? null,
      ownSubmissions,
      applicantCounts: { pending: 0, accepted: 0 },
    };
  } catch {
    return {
      userId: null as string | null,
      isAdmin: false,
      canUse: false,
      ownApplication: null as DbApplication | null,
      ownSubmissions: [] as DbSubmission[],
      applicantCounts: { pending: 0, accepted: 0 },
    };
  }
}

export async function generateMetadata({ params }: RouteParams) {
  const { id } = await params;
  const dbTask = await fetchDbTask(id);
  if (dbTask) {
    return {
      title: dbTask.title,
      description: dbTask.description.slice(0, 160),
    };
  }
  const preview = previewTasks.find((p) => p.id === id);
  return {
    title: preview ? preview.title : "Task",
    description: preview?.summary ?? "Bountix task detail.",
  };
}

export default async function TaskDetailPage({ params }: RouteParams) {
  const { id } = await params;
  const dbTask = await fetchDbTask(id);

  if (dbTask) {
    const ctx = await loadActorContext(dbTask.id);
    const isOwner = ctx.userId === dbTask.creator_id;
    const isOfficial = dbTask.task_type !== "user_task";
    const isClosed = ["completed", "cancelled"].includes(dbTask.status);

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
                  <span
                    className={`inline-flex items-center rounded-md border-2 border-[#140625] px-2 py-1 text-[0.65rem] font-black uppercase shadow-[2px_2px_0_#140625] ${
                      TASK_TYPE_COLOR[dbTask.task_type]
                    }`}
                  >
                    {TASK_TYPE_LABEL[dbTask.task_type]}
                  </span>
                  <span className="inline-flex items-center rounded-md border-2 border-[#140625] bg-white px-2 py-1 text-[0.65rem] font-black uppercase shadow-[2px_2px_0_#140625]">
                    {TASK_STATUS_LABEL[dbTask.status]}
                  </span>
                  {isOfficial ? (
                    <span className="inline-flex items-center rounded-md border-2 border-[#140625] bg-[#ffdd3d] px-2 py-1 text-[0.65rem] font-black uppercase shadow-[2px_2px_0_#140625]">
                      Official by Bountix
                    </span>
                  ) : null}
                </div>

                {dbTask.category ? (
                  <p className="mt-8 text-xs font-black uppercase text-[#7c3cff]">
                    {dbTask.category}
                  </p>
                ) : null}
                <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">
                  {dbTask.title}
                </h1>
                <p className="mt-6 max-w-3xl whitespace-pre-line text-base font-semibold leading-8 text-[#5a3b66]">
                  {dbTask.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border-2 border-[#140625] bg-[#ffdd3d] p-4 shadow-[4px_4px_0_#140625]">
                    <p className="text-xs font-black uppercase text-[#5a3b66]">Reward</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-lg font-black text-[#140625]">
                      {formatUsdc(dbTask.reward_amount ?? 0)}
                      <Image src="/bountix-comic/base-icon.png" alt="Base" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-4 shadow-[4px_4px_0_#140625]">
                    <p className="text-xs font-black uppercase text-[#5a3b66]">Chain</p>
                    <p className="mt-2 text-lg font-black text-[#140625]">{dbTask.chain.toUpperCase()}</p>
                  </div>
                  <div className="rounded-lg border-2 border-[#140625] bg-white p-4 shadow-[4px_4px_0_#140625]">
                    <p className="text-xs font-black uppercase text-[#5a3b66]">Posted</p>
                    <p className="mt-2 text-lg font-black text-[#140625]">{new Date(dbTask.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {dbTask.start_date || dbTask.end_date ? (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625]">
                    <Calendar aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
                    {dbTask.start_date ? `Starts ${new Date(dbTask.start_date).toLocaleDateString()}` : null}
                    {dbTask.start_date && dbTask.end_date ? " · " : null}
                    {dbTask.end_date ? `Ends ${new Date(dbTask.end_date).toLocaleDateString()}` : null}
                  </div>
                ) : null}

                {dbTask.external_link ? (
                  <a href={dbTask.external_link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-[#f0d7ff] px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]">
                    <ExternalLink aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
                    Open external link
                  </a>
                ) : null}

                <div className="mt-8 rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-5 shadow-[5px_5px_0_#140625]">
                  <div className="flex gap-3">
                    <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#7c3cff]" />
                    <div>
                      <h2 className="font-black text-[#140625]">Payment methods available</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#3c214b]">Rewards can be paid via manual off-platform payment or USDC escrow on Base.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="grid h-fit gap-4">
              {isOwner ? (
                <>
                  <div className="comic-card-soft bg-white p-5">
                    <h2 className="text-lg font-black text-[#140625]">You own this task</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                      Edit details, change status, review applicants.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <Link href={`/dashboard/tasks/${dbTask.id}/applicants`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffdd3d]">
                        <Users aria-hidden="true" className="h-4 w-4" />
                        Applicants & submissions
                      </Link>
                      <Link href={`/dashboard/tasks/${dbTask.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-4 text-sm font-black uppercase text-white shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]">
                        <Edit3 aria-hidden="true" className="h-4 w-4" />
                        Edit task
                      </Link>
                    </div>
                  </div>

                  {dbTask.payment_method === "escrow_base" ? (
                    dbTask.escrow_tx_hash ? (
                      <div className="comic-card-soft bg-[#dff7e6] p-5">
                        <h2 className="text-lg font-black text-[#140625]">
                          Escrow funded
                        </h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                          USDC is locked in the Bountix escrow contract on Base.
                        </p>
                        <a
                          href={`https://basescan.org/tx/${dbTask.escrow_tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#7c3cff] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
                        >
                          <ExternalLink aria-hidden="true" className="h-4 w-4" />
                          View funding tx
                        </a>
                      </div>
                    ) : (
                      <EscrowFundPanel
                        taskId={dbTask.id}
                        rewardAmount={dbTask.reward_amount ?? 0}
                      />
                    )
                  ) : null}
                </>
              ) : !ctx.userId ? (
                <div className="comic-card-soft bg-white p-5">
                  <h2 className="text-lg font-black text-[#140625]">Want to apply?</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                    Log in or create an account, then apply with a short pitch.
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Link href="/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#7c3cff] px-4 text-sm font-black uppercase text-white shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ff4fb8]">Log in</Link>
                    <Link href="/signup" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]">Create account</Link>
                  </div>
                </div>
              ) : !ctx.canUse ? (
                <div className="comic-card-soft bg-[#f2e6ff] p-5">
                  <h2 className="text-lg font-black text-[#140625]">Early access pending</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                    Applying to tasks unlocks once Bountix opens early access for your account.
                  </p>
                </div>
              ) : ctx.ownApplication ? (
                <ApplicationStatusCard
                  app={ctx.ownApplication}
                  submissions={ctx.ownSubmissions}
                  taskClosed={isClosed}
                />
              ) : isClosed ? (
                <div className="comic-card-soft bg-white p-5">
                  <h2 className="text-lg font-black text-[#140625]">This task is closed</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                    Applications are no longer open.
                  </p>
                </div>
              ) : (
                <ApplyForm taskId={dbTask.id} />
              )}

              <div className="comic-card-soft bg-[#fffaf4] p-5">
                <h2 className="text-lg font-black text-[#140625]">Scope and milestones</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
                  Agree on scope, milestones, and review notes before work begins. Messaging arrives in a later phase.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  // Fallback to static preview for the original 3 ids.
  const previewTask = getTask(id);
  if (!previewTask) {
    notFound();
  }

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link href="/tasks" className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to tasks
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <article className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-8">
            <div className="halftone-mask absolute -right-10 -top-10 h-40 w-40 opacity-20" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <TaskTypeBadge type="task" />
                <PaymentBadge type={previewTask.paymentType} />
                <StatusBadge status={previewTask.status} />
                <NegotiableBadge negotiable={previewTask.negotiable} />
                <WaitlistOnlyBadge />
              </div>

              <div className="mt-5 rounded-lg border-2 border-[#140625] bg-[#f1d8ff] px-4 py-3 text-sm font-black leading-6 text-[#140625] shadow-[4px_4px_0_#140625]">
                Bountix is live in gated early access. Join the waitlist for
                approval, then create, apply, submit, and review tasks.
                <span className="mt-2 block text-xs font-bold leading-5 text-[#3c214b]">Rewards paid in USDC on Base. Manual payment or Base escrow is available.</span>
              </div>

              <p className="mt-8 text-xs font-black uppercase text-[#7c3cff]">{previewTask.category}</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#140625] sm:text-6xl">{previewTask.title}</h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-[#5a3b66]">{previewTask.summary}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                {[
                  ["Budget", previewTask.budget, "bg-[#ffdd3d]"],
                  ["Timeline", previewTask.timeline, "bg-[#38e7ff]"],
                  ["Applicants", String(previewTask.applicants), "bg-white"],
                  ["Submissions", String(previewTask.submissions), "bg-[#f1d8ff]"],
                ].map(([label, value, color]) => (
                  <div key={label} className={`rounded-lg border-2 border-[#140625] p-4 shadow-[4px_4px_0_#140625] ${color}`}>
                    <p className="text-xs font-black uppercase text-[#5a3b66]">{label}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-lg font-black text-[#140625]">
                      {value}
                      {label === "Budget" && (
                        <Image src="/bountix-comic/base-icon.png" alt="Base" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-black text-[#140625]">Execution brief</h2>
                <div className="mt-4 grid gap-4">
                  {[
                    "Apply with relevant proof, timeline, and any scope questions.",
                    "Negotiate scope or price before work starts if the brief needs changes.",
                    "Submit a final delivery link with notes for review and approval.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-lg border-2 border-[#140625] bg-white p-4 text-sm font-semibold leading-6 text-[#5a3b66] shadow-[4px_4px_0_#140625]">
                      <FileText aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3cff]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-5 shadow-[5px_5px_0_#140625]">
                <div className="flex gap-3">
                  <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#7c3cff]" />
                  <div>
                    <h2 className="font-black text-[#140625]">Payment methods available</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#3c214b]">Rewards can be paid via manual off-platform payment or USDC escrow on Base.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="grid h-fit gap-4">
            <div className="comic-card-soft bg-white p-5">
              <h2 className="text-lg font-black text-[#140625]">Apply to this preview</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">Applications open after early access. Join the waitlist to be first in line.</p>
              <Link href="/waitlist" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]">
                <Users aria-hidden="true" className="h-4 w-4" />
                Join waitlist to start
              </Link>
            </div>

            <SubmissionForm />
          </aside>
        </div>
      </section>
    </main>
  );
}

function ApplicationStatusCard({
  app,
  submissions,
  taskClosed,
}: {
  app: DbApplication;
  submissions: DbSubmission[];
  taskClosed: boolean;
}) {
  const withdraw = withdrawApplicationAction.bind(null, app.id);
  const latest = submissions[0];

  return (
    <>
      <div className="comic-card-soft bg-white p-5">
        <p className="comic-chip bg-[#38e7ff]">Your application</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md border-2 border-[#140625] px-2 py-1 text-[0.7rem] font-black uppercase shadow-[2px_2px_0_#140625] ${APPLICATION_STATUS_COLOR[app.status]}`}
          >
            {APPLICATION_STATUS_LABEL[app.status]}
          </span>
          <span className="text-xs font-bold text-[#5a3b66]">
            {new Date(app.created_at).toLocaleDateString()}
          </span>
        </div>
        {app.message ? (
          <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#3c214b]">
            {app.message}
          </p>
        ) : null}

        {app.status === "pending" && !taskClosed ? (
          <form action={withdraw} className="mt-4">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-4 text-xs font-black uppercase text-[#c42463] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffe1ed]"
            >
              Withdraw application
            </button>
          </form>
        ) : null}
      </div>

      {app.status === "accepted" && !latest ? (
        <SubmitWorkForm applicationId={app.id} />
      ) : null}

      {latest ? (
        <div className="comic-card-soft bg-white p-5">
          <p className="comic-chip bg-[#ffdd3d]">Your submission</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md border-2 border-[#140625] px-2 py-1 text-[0.7rem] font-black uppercase shadow-[2px_2px_0_#140625] ${SUBMISSION_STATUS_COLOR[latest.status]}`}
            >
              {SUBMISSION_STATUS_LABEL[latest.status]}
            </span>
            <span className="text-xs font-bold text-[#5a3b66]">
              {new Date(latest.created_at).toLocaleDateString()}
            </span>
          </div>
          <a
            href={latest.delivery_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-2 text-sm font-black text-[#7c3cff] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            {latest.delivery_url}
          </a>
          {latest.notes ? (
            <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#3c214b]">
              {latest.notes}
            </p>
          ) : null}
          {latest.review_notes ? (
            <div className="mt-4 rounded-lg border-2 border-dashed border-[#140625] bg-[#f2e6ff] p-3 text-sm font-bold text-[#3c214b]">
              <p className="text-xs font-black uppercase text-[#7c3cff]">
                Reviewer feedback
              </p>
              <p className="mt-2 whitespace-pre-line">{latest.review_notes}</p>
            </div>
          ) : null}
          {latest.status === "revision_requested" ? (
            <p className="mt-3 text-xs font-bold text-[#5a3b66]">
              Revision requested. Submit a new attempt below.
            </p>
          ) : null}
        </div>
      ) : null}

      {app.status === "accepted" &&
      latest &&
      latest.status === "revision_requested" ? (
        <SubmitWorkForm applicationId={app.id} />
      ) : null}
    </>
  );
}
