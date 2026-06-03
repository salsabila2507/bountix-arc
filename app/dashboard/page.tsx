import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Coins,
  ListTodo,
  Megaphone,
  Send,
  User,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
  description: "Bountix dashboard overview.",
};

async function loadActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, role, can_use_platform")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile };
}

export default async function DashboardPage() {
  const ctx = await loadActor();
  if (!ctx) redirect("/login");
  const { profile } = ctx;
  const isAdmin = profile?.role === "admin";

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="comic-chip bg-[#38e7ff]">Dashboard</p>
            <h1 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              {profile?.username ? `Hi, @${profile.username}` : "Dashboard"}
            </h1>
            <p className="mt-3 text-sm font-bold leading-6 text-[#5a3b66]">
              Manage your profile, tasks, and applications. Rewards paid in USDC on
              Base. Manual payment or Base escrow is available.
            </p>
          </div>
          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#7c3cff] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ff4fb8]"
            >
              <Megaphone aria-hidden="true" className="h-4 w-4" />
              Admin
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            href="/dashboard/profile"
            color="bg-[#ffdd3d]"
            icon={<User aria-hidden="true" className="h-5 w-5" />}
            title="Profile"
            description="View and edit your public profile."
          />
          <DashboardCard
            href="/dashboard/tasks"
            color="bg-[#38e7ff]"
            icon={<ListTodo aria-hidden="true" className="h-5 w-5" />}
            title="My tasks"
            description="Tasks you posted, drafts, and history."
          />
          <DashboardCard
            href="/dashboard/applications"
            color="bg-[#f0d7ff]"
            icon={<Send aria-hidden="true" className="h-5 w-5" />}
            title="My applications"
            description="Tasks you've applied to and submissions you've made."
          />
          <DashboardCard
            href="/post-task"
            color="bg-[#ff4fb8] text-white"
            icon={<Coins aria-hidden="true" className="h-5 w-5" />}
            title="Post a task"
            description="Create a new task with a USDC reward."
          />
          <DashboardCard
            href="/tasks"
            color="bg-white"
            icon={<ArrowRight aria-hidden="true" className="h-5 w-5" />}
            title="Browse tasks"
            description="See open tasks across Bountix."
          />
          {isAdmin ? (
            <DashboardCard
              href="/admin"
              color="bg-[#7c3cff] text-white"
              icon={<Megaphone aria-hidden="true" className="h-5 w-5" />}
              title="Admin center"
              description="Official content, queues, platform stats."
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  href,
  color,
  icon,
  title,
  description,
}: {
  href: string;
  color: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="comic-card group bg-white p-5 transition hover:-translate-y-0.5"
    >
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-lg border-2 border-[#140625] shadow-[3px_3px_0_#140625] ${color}`}
      >
        {icon}
      </span>
      <h2 className="mt-4 text-xl font-black uppercase text-[#140625]">
        {title}
      </h2>
      <p className="mt-2 text-sm font-bold leading-6 text-[#5a3b66]">
        {description}
      </p>
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#7c3cff]">
        Open
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
