"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import { joinWaitlist } from "@/app/waitlist/actions";
import { initialWaitlistState, roles } from "@/lib/waitlist";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-300">{message}</p>;
}

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(
    joinWaitlist,
    initialWaitlistState,
  );

  if (state.status === "success") {
    return (
      <div className="panel rounded-lg p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-acid-400/30 bg-acid-400/10 text-acid-300">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-white">
          You are on the waitlist.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/64">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="panel rounded-lg p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-acid-300">
          Early access
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Join the TaskOps waitlist
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Tell us how you plan to use TaskOps. We are onboarding the first
          creators and operators in focused waves.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <div className="mt-6 flex gap-3 rounded-md border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100">
          <TriangleAlert
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-red-300"
          />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-white/82">Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Your name or operator handle"
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-graphite-950/80 px-3 text-white placeholder:text-white/28 outline-none transition focus:border-acid-400 focus:ring-2 focus:ring-acid-400/30"
          />
          <FieldError message={state.errors?.name} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-white/82">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-graphite-950/80 px-3 text-white placeholder:text-white/28 outline-none transition focus:border-acid-400 focus:ring-2 focus:ring-acid-400/30"
          />
          <FieldError message={state.errors?.email} />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-white/82">Role</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {roles.map((role) => (
              <label
                key={role}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-graphite-950/70 px-3 text-sm text-white/72 transition has-[:checked]:border-acid-400/60 has-[:checked]:bg-acid-400/10 has-[:checked]:text-white"
              >
                <input
                  name="role"
                  type="radio"
                  value={role}
                  required
                  className="h-4 w-4 border-white/25 bg-transparent text-acid-400 focus:ring-acid-400"
                />
                {role}
              </label>
            ))}
          </div>
          <FieldError message={state.errors?.role} />
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-white/82">
            Specialty <span className="text-white/35">optional</span>
          </span>
          <input
            name="specialty"
            type="text"
            maxLength={120}
            placeholder="Research, design, growth, data, ops..."
            className="mt-2 h-12 w-full rounded-md border border-white/10 bg-graphite-950/80 px-3 text-white placeholder:text-white/28 outline-none transition focus:border-acid-400 focus:ring-2 focus:ring-acid-400/30"
          />
          <FieldError message={state.errors?.specialty} />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-acid-400/40 bg-acid-400 px-5 py-3 text-sm font-semibold text-graphite-950 shadow-acid-soft transition hover:bg-acid-300 focus:outline-none focus:ring-2 focus:ring-acid-300 focus:ring-offset-2 focus:ring-offset-graphite-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Waitlist"
        )}
      </button>
    </form>
  );
}
