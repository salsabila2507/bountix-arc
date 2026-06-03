import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { EscrowReleasePanel } from "@/components/marketplace/escrow-release-panel";
import {
  decideApplicationAction,
  reviewSubmissionAction,
} from "@/app/applications/actions";
import { createClient } from "@/lib/supabase/server";
import { TASK_LIST_COLUMNS, isUuid, type DbTask } from "@/lib/tasks";
import {
  APPLICATION_COLUMNS,
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_LABEL,
  SUBMISSION_COLUMNS,
  SUBMISSION_STATUS_COLOR,
  SUBMISSION_STATUS_LABEL,
  type DbApplication,
  type DbSubmission,
} from "@/lib/applications";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Applicants",
  description: "Review applicants and submissions for your task.",
};

type ProfileLite = {
  id: string;
  username: string;
  display_name: string | null;
  wallet_address: string | null;
};

async function loadPage(taskId: string) {
  if (!isUuid(taskId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: task } = await supabase
    .from("tasks")
    .select(TASK_LIST_COLUMNS)
    .eq("id", taskId)
    .maybeSingle();
  if (!task) return null;

  const isAdmin = profile?.role === "admin";
  const isOwner = task.creator_id === user.id;
  if (!isAdmin && !isOwner) return null;

  const { data: applications } = await supabase
    .from("task_applications")
    .select(APPLICATION_COLUMNS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  const apps = (applications ?? []) as DbApplication[];
  const applicantIds = Array.from(new Set(apps.map((a) => a.applicant_id)));

  const profilesByUser = new Map<string, ProfileLite>();
  if (applicantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, wallet_address");
    for (const p of profiles ?? []) {
      profilesByUser.set(p.id, p as ProfileLite);
    }
  }

  const { data: submissions } = await supabase
    .from("task_submissions")
    .select(SUBMISSION_COLUMNS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  const subs = (submissions ?? []) as DbSubmission[];
  const subsByApp = new Map<string, DbSubmission[]>();
  for (const s of subs) {
    const arr = subsByApp.get(s.application_id) ?? [];
    arr.push(s);
    subsByApp.set(s.application_id, arr);
  }

  return {
    task: task as DbTask,
    apps,
    profilesByUser,
    subsByApp,
  };
}

export default async function ApplicantsPage({ params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await loadPage(id);
  if (!data) notFound();

  const { task, apps, profilesByUser, subsByApp } = data;

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href={`/tasks/${task.id}`}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to task
        </Link>

        <div className="mt-6">
          <p className="comic-chip bg-[#ffdd3d]">Manage applicants</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black uppercase leading-none sm:text-5xl">
            {task.title}
          </h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#5a3b66]">
            Accept or reject applicants. Review submissions when work comes in.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {apps.length === 0 ? (
            <div className="comic-card bg-white p-6 text-center sm:p-8">
              <h2 className="text-xl font-black text-[#140625]">
                No applicants yet
              </h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#5a3b66]">
                Once people apply they show up here.
              </p>
            </div>
          ) : (
            apps.map((app) => {
              const applicant = profilesByUser.get(app.applicant_id);
              const subs = subsByApp.get(app.id) ?? [];
              const acceptAction = decideApplicationAction.bind(
                null,
                app.id,
                "accepted",
              );
              const rejectAction = decideApplicationAction.bind(
                null,
                app.id,
                "rejected",
              );

              return (
                <article
                  key={app.id}
                  className="comic-card bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={
                          applicant
                            ? `/profile/${applicant.username}`
                            : "#"
                        }
                        className="text-sm font-black uppercase text-[#7c3cff]"
                      >
                        @{applicant?.username ?? "unknown"}
                      </Link>
                      {applicant?.display_name ? (
                        <p className="text-base font-bold text-[#140625]">
                          {applicant.display_name}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md border-2 border-[#140625] px-2 py-1 text-[0.7rem] font-black uppercase shadow-[2px_2px_0_#140625] ${APPLICATION_STATUS_COLOR[app.status]}`}
                    >
                      {APPLICATION_STATUS_LABEL[app.status]}
                    </span>
                  </div>

                  {app.message ? (
                    <p className="mt-3 whitespace-pre-line rounded-lg border-2 border-dashed border-[#140625] bg-[#fffaf4] p-3 text-sm font-semibold leading-6 text-[#3c214b]">
                      {app.message}
                    </p>
                  ) : null}

                  {app.status === "pending" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={acceptAction}>
                        <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-[#23b26d] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#1f6b3a]">
                          Accept
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#c42463] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffe1ed]">
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : null}

                  {subs.length > 0 ? (
                    <div className="mt-5 grid gap-3">
                      <p className="text-xs font-black uppercase text-[#5a3b66]">
                        Submissions
                      </p>
                      {subs.map((s) => {
                        const review = reviewSubmissionAction.bind(null, s.id);
                        const editable = s.status === "pending_review";
                        return (
                          <div
                            key={s.id}
                            className="rounded-lg border-2 border-[#140625] bg-[#fffaf4] p-4 shadow-[3px_3px_0_#140625]"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-md border-2 border-[#140625] px-2 py-1 text-[0.65rem] font-black uppercase shadow-[2px_2px_0_#140625] ${SUBMISSION_STATUS_COLOR[s.status]}`}
                              >
                                {SUBMISSION_STATUS_LABEL[s.status]}
                              </span>
                              <span className="text-xs font-bold text-[#5a3b66]">
                                {new Date(s.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <a
                              href={s.delivery_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex items-center gap-2 break-all rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#7c3cff] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
                            >
                              <ExternalLink
                                aria-hidden="true"
                                className="h-4 w-4"
                              />
                              {s.delivery_url}
                            </a>
                            {s.notes ? (
                              <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-[#3c214b]">
                                {s.notes}
                              </p>
                            ) : null}

                            {editable ||
                            s.status === "revision_requested" ? (
                              <form action={review} className="mt-4 grid gap-2">
                                <textarea
                                  name="review_notes"
                                  rows={3}
                                  maxLength={2000}
                                  defaultValue={s.review_notes ?? ""}
                                  placeholder="Reviewer notes (optional)"
                                  className="w-full rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-medium text-[#140625] placeholder:text-[#5a3b66]/45 outline-none focus:ring-2 focus:ring-[#38e7ff]"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    name="decision"
                                    value="approved"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-[#23b26d] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    name="decision"
                                    value="revision_requested"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5"
                                  >
                                    Request revision
                                  </button>
                                  <button
                                    name="decision"
                                    value="rejected"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#c42463] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ffe1ed]"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </form>
                            ) : null}

                            {s.review_notes &&
                            (s.status === "approved" ||
                              s.status === "rejected") ? (
                              <p className="mt-3 rounded-lg border-2 border-dashed border-[#140625] bg-[#f2e6ff] p-3 text-sm font-bold text-[#3c214b]">
                                {s.review_notes}
                              </p>
                            ) : null}

                            {s.status === "approved" && task.payment_method === "escrow_base" && !s.released_at ? (
                              <EscrowReleasePanel
                                submissionId={s.id}
                                taskId={task.id}
                                rewardAmount={task.reward_amount}
                                workerWalletAddress={applicant ? applicant.wallet_address : null}
                              />
                            ) : null}

                            {s.released_at ? (
                              <div className="mt-4 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-3 text-sm font-bold text-[#1f6b3a]">
                                ✓ Escrow released on {new Date(s.released_at).toLocaleDateString()}
                                {s.assign_tx_hash ? (
                                  <div className="mt-2 space-y-1">
                                    <a
                                      href={`https://basescan.org/tx/${s.assign_tx_hash}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block text-xs font-black text-[#7c3cff] hover:underline"
                                    >
                                      View assign tx
                                    </a>
                                  </div>
                                ) : null}
                                {s.release_tx_hash ? (
                                  <div className="space-y-1">
                                    <a
                                      href={`https://basescan.org/tx/${s.release_tx_hash}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block text-xs font-black text-[#7c3cff] hover:underline"
                                    >
                                      View release tx
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
