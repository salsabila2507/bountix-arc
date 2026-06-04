"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  REWARD_MODES,
  REWARD_MODE_LABEL,
  type DbTask,
  type PaymentMethod,
  type RewardMode,
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
  const [rewardMode, setRewardMode] = useState<RewardMode>(
    def?.reward_mode ?? "fixed",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    def?.payment_method ?? "manual",
  );
  const [winnerCount, setWinnerCount] = useState(
    def?.raffle_winner_count ?? 1,
  );
  const isRaffle = rewardMode === "raffle";

  return (
    <form action={formAction} className="comic-card bg-white p-5 sm:p-6">
      <p className="comic-chip bg-[#38e7ff]">
        {mode === "create" ? "Post a task" : "Edit task"}
      </p>
      <h1 className="mt-5 text-2xl font-black text-[#140625]">
        {mode === "create" ? "Create a new task" : "Edit your task"}
      </h1>
      <p className="mt-3 text-sm font-medium leading-6 text-[#5a3b66]">
        Rewards are paid in USDC on Base. Manual payment or Base escrow is available.
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
              Reward (USDC){isRaffle ? " per winner" : " "}
              {!isRaffle ? (
                <span className="text-[#5a3b66]">optional</span>
              ) : null}
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

        <fieldset className="block">
          <legend className="text-sm font-black text-[#140625]">
            Reward mode
          </legend>
          <p className="mt-1 text-xs font-bold text-[#5a3b66]">
            Fixed tasks pay one selected worker. Raffle tasks collect eligible
            submissions, then randomly select one or more winners.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {REWARD_MODES.map((modeValue, i) => (
              <label
                key={modeValue}
                className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#140625] bg-[#fffaf4] p-3 shadow-[3px_3px_0_#140625] transition hover:bg-white has-[:checked]:bg-[#ffdd3d]"
              >
                <input
                  type="radio"
                  name="reward_mode"
                  value={modeValue}
                  defaultChecked={
                    def?.reward_mode
                      ? def.reward_mode === modeValue
                      : i === 0
                  }
                  onChange={() => setRewardMode(modeValue)}
                  className="mt-1 h-4 w-4 accent-[#7c3cff]"
                />
                <span className="text-sm font-black text-[#140625]">
                  {REWARD_MODE_LABEL[modeValue]}
                  {modeValue === "raffle" ? (
                    <span className="mt-1 block text-xs font-bold text-[#5a3b66]">
                      Select random winners from owner-approved eligible
                      submissions.
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs font-bold text-[#5a3b66]">
                      Standard application, submission, review, and payout
                      flow.
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
          <FieldError message={state.fieldErrors?.reward_mode} />
        </fieldset>

        {isRaffle ? (
          <div className="grid gap-5">
            <label className="block">
              <span className="text-sm font-black text-[#140625]">
                Number of winners
              </span>
              <input
                name="raffle_winner_count"
                type="number"
                required
                min="1"
                max="50"
                step="1"
                defaultValue={def?.raffle_winner_count ?? 1}
                onChange={(event) =>
                  setWinnerCount(Number(event.currentTarget.value || "1"))
                }
                className={input}
              />
              <FieldError message={state.fieldErrors?.raffle_winner_count} />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#140625]">
                Eligibility rules
              </span>
              <textarea
                name="eligibility_rules"
                rows={4}
                required
                maxLength={2000}
                defaultValue={def?.eligibility_rules ?? ""}
                placeholder="Who can enter, what counts as a valid submission, and any proof required."
                className="mt-2 w-full rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-3 font-medium text-[#140625] placeholder:text-[#5a3b66]/45 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#38e7ff]"
              />
              <FieldError message={state.fieldErrors?.eligibility_rules} />
            </label>
          </div>
        ) : null}

        <fieldset className="block">
          <legend className="text-sm font-black text-[#140625]">
            Payment method
          </legend>
          <p className="mt-1 text-xs font-bold text-[#5a3b66]">
            Manual keeps payment off-platform. Escrow locks USDC in the
            Bountix contract on Base (reward of at least 1 USDC required); the
            task opens after you fund it.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method, i) => (
              <label
                key={method}
                className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#140625] bg-[#fffaf4] p-3 shadow-[3px_3px_0_#140625] transition hover:bg-white has-[:checked]:bg-[#38e7ff]"
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method}
                  defaultChecked={
                    def?.payment_method
                      ? def.payment_method === method
                      : i === 0
                  }
                  onChange={() => setPaymentMethod(method)}
                  className="mt-1 h-4 w-4 accent-[#7c3cff]"
                />
                <span className="text-sm font-black text-[#140625]">
                  {PAYMENT_METHOD_LABEL[method]}
                  {method === "escrow_base" ? (
                    <span className="mt-1 block text-xs font-bold text-[#5a3b66]">
                      Connect wallet, approve, and fund after posting.
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs font-bold text-[#5a3b66]">
                      Works as today. No wallet needed.
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
          {isRaffle &&
          paymentMethod === "escrow_base" &&
          winnerCount > 1 ? (
            <p className="mt-3 rounded-lg border-2 border-[#140625] bg-[#ffe1ed] p-3 text-xs font-black leading-5 text-[#8a1742]">
              Current escrow V0 supports one payout per escrow task. Use manual
              payment for multi-winner raffles.
            </p>
          ) : isRaffle && paymentMethod === "escrow_base" ? (
            <p className="mt-3 rounded-lg border-2 border-[#140625] bg-[#dff7e6] p-3 text-xs font-black leading-5 text-[#1f6b3a]">
              Compatible: one winner can be paid through the existing Base
              escrow release flow after selection.
            </p>
          ) : null}
          <FieldError message={state.fieldErrors?.payment_method} />
        </fieldset>

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
              {isRaffle ? "Deadline" : "End date"}{" "}
              {!isRaffle ? (
                <span className="text-[#5a3b66]">optional</span>
              ) : null}
            </span>
            <input
              name="end_date"
              type="datetime-local"
              required={isRaffle}
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
          Manual payment or Base escrow is available when compatible.
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
