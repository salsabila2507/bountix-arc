import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DbTaskCard } from "@/components/marketplace/db-task-card";
import { createClient } from "@/lib/supabase/server";
import { TASK_LIST_COLUMNS, type DbTask } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  description:
    "Bountix admin area. Manage official tasks, giveaways, campaigns, announcements, and updates.",
};

async function loadAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { authorized: false as const };

  const { data: tasks } = await supabase
    .from("tasks")
    .select(TASK_LIST_COLUMNS)
    .neq("task_type", "user_task")
    .order("created_at", { ascending: false })
    .limit(50);

  // Stats
  const { count: pendingApps } = await supabase
    .from("task_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingSubs } = await supabase
    .from("task_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");

  const { count: totalTasks } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true });

  return {
    authorized: true as const,
    officialTasks: (tasks ?? []) as DbTask[],
    stats: {
      pendingApps: pendingApps ?? 0,
      pendingSubs: pendingSubs ?? 0,
      totalTasks: totalTasks ?? 0,
    },
  };
}

export default async function AdminHomePage() {
  const result = await loadAdmin();
  if (!result.authorized) redirect("/dashboard/profile");

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="comic-chip bg-[#7c3cff] text-white">
              <Megaphone aria-hidden="true" className="h-3.5 w-3.5" />
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              Bountix admin
            </h1>
            <p className="mt-3 text-sm font-bold leading-6 text-[#5a3b66]">
              Publish official tasks, giveaways, campaigns, announcements, and
              updates. Review applicant + submission queues across the
              platform.
            </p>
          </div>
          <Link
            href="/post-task"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
          >
            New official content
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-[#140625] bg-[#ffdd3d] p-5 shadow-[5px_5px_0_#140625]">
            <p className="text-xs font-black uppercase text-[#5a3b66]">
              Pending applicants
            </p>
            <p className="mt-2 text-3xl font-black text-[#140625]">
              {result.stats.pendingApps}
            </p>
          </div>
          <div className="rounded-lg border-2 border-[#140625] bg-[#38e7ff] p-5 shadow-[5px_5px_0_#140625]">
            <p className="text-xs font-black uppercase text-[#5a3b66]">
              Pending review
            </p>
            <p className="mt-2 text-3xl font-black text-[#140625]">
              {result.stats.pendingSubs}
            </p>
          </div>
          <div className="rounded-lg border-2 border-[#140625] bg-white p-5 shadow-[5px_5px_0_#140625]">
            <p className="text-xs font-black uppercase text-[#5a3b66]">
              Tasks total
            </p>
            <p className="mt-2 text-3xl font-black text-[#140625]">
              {result.stats.totalTasks}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-black uppercase leading-none">
            Official content
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#5a3b66]">
            Posts marked official_task / giveaway / campaign / announcement /
            update.
          </p>
        </div>

        {result.officialTasks.length === 0 ? (
          <div className="comic-card mt-6 bg-white p-6 text-center sm:p-8">
            <h3 className="text-lg font-black text-[#140625]">
              No official content yet
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-[#5a3b66]">
              Use{" "}
              <Link
                href="/post-task"
                className="font-black text-[#7c3cff] underline decoration-2 underline-offset-2"
              >
                Post a task
              </Link>{" "}
              and pick an admin task type to publish official content.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {result.officialTasks.map((t) => (
              <DbTaskCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
