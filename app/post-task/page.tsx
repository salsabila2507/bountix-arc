import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Hourglass, LockKeyhole } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TaskForm } from "@/components/marketplace/task-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post a Task",
  description:
    "Create a new Bountix task. Rewards paid in USDC on Base. Manual payment or Base escrow available.",
};

async function loadActor() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null as null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, can_use_platform, username")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user,
      profile: profile as
        | {
            id: string;
            role: string;
            can_use_platform: boolean;
            username: string;
          }
        | null,
    };
  } catch {
    return { user: null, profile: null as null };
  }
}

export default async function PostTaskPage() {
  const { user, profile } = await loadActor();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    // Trigger should have made one; fallback message:
    return (
      <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
        <SiteHeader />
        <section className="container-page py-10">
          <p className="text-base font-semibold text-[#5a3b66]">
            Your profile is missing. Refresh and try again.
          </p>
        </section>
      </main>
    );
  }

  const isAdmin = profile.role === "admin";
  const canCreate = profile.can_use_platform || isAdmin;

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to my tasks
        </Link>

        {canCreate ? (
          <section className="mx-auto mt-8 max-w-2xl">
            <TaskForm mode="create" isAdmin={isAdmin} />
          </section>
        ) : (
          <section className="mx-auto mt-8 max-w-2xl">
            <div className="comic-card bg-white p-6 sm:p-8">
              <p className="comic-chip bg-[#ff4fb8] text-white">
                <Hourglass aria-hidden="true" className="h-3.5 w-3.5" />
                Early access pending
              </p>
              <h1 className="mt-5 text-2xl font-black text-[#140625]">
                Posting opens after early access
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-[#5a3b66]">
                Your account does not have create access yet. Bountix is
                opening posting to waitlist members in waves. You can still
                edit your profile in the meantime.
              </p>
              <div className="mt-6 rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-4 text-sm font-bold text-[#3c214b] shadow-[3px_3px_0_#140625]">
                <LockKeyhole
                  aria-hidden="true"
                  className="mr-2 inline h-4 w-4 text-[#7c3cff]"
                />
                Rewards are paid in USDC on Base. Manual payment or Base escrow is available.
              </div>
              <Link
                href="/dashboard/profile"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-4 text-sm font-black uppercase text-[#140625] shadow-[4px_4px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
              >
                Back to dashboard
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
