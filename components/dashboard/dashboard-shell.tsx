import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/submissions", label: "Submissions" },
  { href: "/dashboard/deals", label: "Deals" },
  { href: "/dashboard/profile", label: "Profile" },
];

type DashboardShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen text-white">
      <SiteHeader />
      <section className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="panel h-fit rounded-lg p-3">
            <div className="flex items-center gap-2 px-2 py-3 text-sm font-semibold text-white">
              <LayoutDashboard
                aria-hidden="true"
                className="h-4 w-4 text-aurora-300"
              />
              Dashboard
            </div>
            <nav className="mt-2 grid gap-1">
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-white/58 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-aurora-300">
              Marketplace console
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/58">
              {description}
            </p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
