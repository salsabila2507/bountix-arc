"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { createTaskAction, updateTaskAction } from "@/app/tasks/actions";
import {
  initialTaskFormState,
  type TaskFormState,
} from "@/lib/task-form-state";
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TASK_TYPES,
  TASK_TYPE_LABEL,
  type DbTask,
} from "@/lib/tasks";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-bold text-[#c42463]">{message}</p>;
}

const input =
  "mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-medium text-[#140625] placeholder:text-[#5a3b66]/45 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]";

export function TaskForm({
  mode,
  isAdmin,
  initialTask,
}: {
  mode: "create" | "edit";
  isAdmin: boolean;
  initialTask?: DbTask;
}) {
  const boundAction =
    mode === "edit" && initialTask
      ? updateTaskAction.bind(null, initialTask.id)
      : createTaskAction;

  const [state, formAction, isPending] = useActionState<
    TaskFormState,
    FormData
  >(boundAction, initialTaskFormState);

  const def = initialTask;
  const allowedTypes = isAdmin ? TASK_TYPES : (["user_task"] as const);

  return (
    <form action={formAction} className="comic-card bg-white p-5 sm:p-6">
      <p className="comic-chip bg-[#38e7ff]">
        {mode === "create" ? "Post a task" : "Edit task"}
      </p>
      <h1 className="mt-5 text-2xl font-black text-[#140625]">
        {mode === "create" ? "Create a new task" : "Edit your task"}
      </h1>
      <p className="mt-3 text-sm font-medium leading-6 text-[#5a3b66]">
        Rewards are paid in USDC on Base. Escrow on Base coming soon.
      </p>

      {state.status === "error" && state.message ? (
        <div className="mt-6 flex gap-3 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-sm font-bold text-[#8a1742]">
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <p>{state.message}</p>
        </div>
      ) : null}
      {state.status === "success" ? (
        <div className="mt-6 flex gap-3 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-3 text-sm font-bold text-[#1f6b3a]">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-black text-[#140625]">Title</span>
          <input
            name="title"
            type="text"
            required
            minLength={4}
            maxLength={140}
            defaultValue={def?.title ?? ""}
            placeholder="e.g. Map 40 active creator communities for launch outreach"
            className={input}
          />
          <FieldError message={state.fieldErrors?.title} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#140625]">
            Description
          </span>
          <textarea
            name="description"
            rows={6}
            required
            maxLength={4000}
            defaultValue={def?.description ?? ""}
            placeholder="Brief, deliverables, acceptance criteria, any constraints."
            className="mt-2 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-3 font-medium text-[#140625] placeholder:text-[#5a3b66]/45 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
          />
          <FieldError message={state.fieldErrors?.description} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#140625]">
              Category{" "}
              <span className="text-[#5a3b66]">optional</span>
            </span>
            <input
              name="category"
              type="text"
              maxLength={60}
              defaultValue={def?.category ?? ""}
              placeholder="Research, growth, design ops"
              className={input}
            />
            <FieldError message={state.fieldErrors?.category} />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#140625]">
              Reward (USDC){" "}
              <span className="text-[#5a3b66]">optional</span>
            </span>
            <input
              name="reward_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={def?.reward_amount ?? ""}
              placeholder="50.00"
              className={input}
            />
            <FieldError message={state.fieldErrors?.reward_amount} />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#140625]">Status</span>
            <select
              name="status"
              defaultValue={def?.status ?? "draft"}
              className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-bold text-[#140625] outline-none focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors?.status} />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#140625]">
              Task type
            </span>
            <select
              name="task_type"
              defaultValue={def?.task_type ?? "user_task"}
              className="mt-2 h-12 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 font-bold text-[#140625] outline-none focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABEL[t]}
                  {(t === "official_task" ||
                    t === "giveaway" ||
                    t === "campaign" ||
                    t === "announcement" ||
                    t === "update") &&
                    " (admin)"}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors?.task_type} />
            {!isAdmin && (
              <p className="mt-2 text-xs font-bold text-[#5a3b66]">
                Only admins can post official, giveaway, campaign,
                announcement, or update.
              </p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-black text-[#140625]">
            External link{" "}
            <span className="text-[#5a3b66]">optional</span>
          </span>
          <input
            name="external_link"
            type="url"
            maxLength={500}
            defaultValue={def?.external_link ?? ""}
            placeholder="https://..."
            className={input}
          />
          <FieldError message={state.fieldErrors?.external_link} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-[#140625]">
              Start date{" "}
              <span className="text-[#5a3b66]">optional</span>
            </span>
            <input
              name="start_date"
              type="datetime-local"
              defaultValue={
                def?.start_date
                  ? new Date(def.start_date).toISOString().slice(0, 16)
                  : ""
              }
              className={input}
            />
            <FieldError message={state.fieldErrors?.start_date} />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#140625]">
              End date{" "}
              <span className="text-[#5a3b66]">optional</span>
            </span>
            <input
              name="end_date"
              type="datetime-local"
              defaultValue={
                def?.end_date
                  ? new Date(def.end_date).toISOString().slice(0, 16)
                  : ""
              }
              className={input}
            />
            <FieldError message={state.fieldErrors?.end_date} />
          </label>
        </div>

        <div className="rounded-lg border-2 border-dashed border-[#140625] bg-[#f2e6ff] p-4 text-sm font-bold text-[#3c214b]">
          <Sparkles
            aria-hidden="true"
            className="mr-2 inline h-4 w-4 text-[#7c3cff]"
          />
          Rewards paid in <span className="font-black">USDC on Base</span>.
          Escrow on Base coming soon — payments are not on-chain yet.
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-5 py-3 text-sm font-black uppercase text-white shadow-[5px_5px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff] disabled:cursor-not-allowed disabled:bg-[#c9c0d3] disabled:text-[#5a3b66]"
        >
          {isPending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
              {mode === "create" ? "Posting…" : "Saving…"}
            </>
          ) : (
            <>
              <Save aria-hidden="true" className="h-4 w-4" />
              {mode === "create" ? "Post task" : "Save changes"}
            </>
          )}
        </button>
        <Link
          href={mode === "edit" && def ? `/tasks/${def.id}` : "/dashboard/tasks"}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-5 py-3 text-sm font-black uppercase text-[#140625] shadow-[5px_5px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
