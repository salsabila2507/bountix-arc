import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Globe2,
  Hourglass,
  LockKeyhole,
  Megaphone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "About",
  description:
    "Bountix is a gated early-access task marketplace built around USDC on Base.",
};

export default function AboutPage() {
  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-10 sm:py-14">
        <div className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-10">
          <div className="halftone-mask absolute inset-0 opacity-15" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-[#140625] bg-[#7c3cff]/40" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="comic-chip bg-[#7c3cff] text-white">
                <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
                Built for Base
              </p>
              <h1 className="mt-5 text-4xl font-black uppercase leading-[0.95] sm:text-6xl">
                Bountix turns task work into onchain-ready rewards.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-[#3c214b] sm:text-lg">
                A gated early-access task marketplace. Approved waitlist users
                create and complete tasks. Bountix and partners publish
                official tasks, campaigns, announcements, and giveaways.
                Rewards are designed around USDC on Base.
              </p>
            </div>
            <div className="grid gap-3 text-sm font-bold leading-6 text-[#5a3b66]">
              <Link
                href="/waitlist"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-5 py-3 text-sm font-black uppercase text-white shadow-[5px_5px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
              >
                Join waitlist
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/tasks"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-5 py-3 text-sm font-black uppercase text-[#140625] shadow-[5px_5px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#38e7ff]"
              >
                Browse tasks
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Pillar
            icon={<BadgeCheck className="h-5 w-5" />}
            color="bg-[#38e7ff]"
            title="Gated early access"
            text="Approved waitlist users post real tasks and apply to ship work. Public visitors can preview without unlocking write actions."
          />
          <Pillar
            icon={<Coins className="h-5 w-5" />}
            color="bg-[#ffdd3d]"
            title="USDC on Base"
            text="Every reward is denominated in USDC on Base. No custom token, no USDT. Wallet connect arrives later."
          />
          <Pillar
            icon={<LockKeyhole className="h-5 w-5" />}
            color="bg-[#f0d7ff]"
            title="Escrow on Base — coming soon"
            text="Smart-contract escrow on Base is the next milestone. The schema and UI are already shaped around USDC release flows."
          />
          <Pillar
            icon={<Megaphone className="h-5 w-5" />}
            color="bg-[#7c3cff] text-white"
            title="Official content"
            text="Bountix and partners publish official tasks, giveaways, campaigns, announcements, and updates. Admin gating is enforced at the database layer."
          />
          <Pillar
            icon={<Send className="h-5 w-5" />}
            color="bg-[#ff4fb8] text-white"
            title="Apply & submit"
            text="Workers apply, creators accept, accepted workers submit external delivery links. Reviews approve, reject, or request revision."
          />
          <Pillar
            icon={<ShieldCheck className="h-5 w-5" />}
            color="bg-white"
            title="Free-tier friendly"
            text="No file uploads, no realtime, no analytics tables. Lightweight schema, RLS-recursion-safe via SECURITY DEFINER helpers."
          />
        </div>

        <div className="mt-10 rounded-[1rem] border-2 border-[#140625] bg-white p-6 shadow-[8px_8px_0_#140625] sm:p-10">
          <p className="comic-chip bg-[#ffdd3d]">How it works</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="1" title="Sign up & profile" text="Email + password. Pick a username. Bountix decides early-access activation per user." />
            <Step n="2" title="Post or apply" text="Approved users post tasks with a USDC reward, or apply to existing ones with a short pitch." />
            <Step n="3" title="Submit work" text="Accepted workers paste a delivery link. No file upload — point to repo, doc, or hosted artefact." />
            <Step n="4" title="Review & release" text="Creators approve, reject, or request a revision. USDC release on Base is coming next." />
          </ol>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Stat
            title="Status"
            body="Phase 3 of the MVP: tasks, applications, and submissions are live in early access. Wallet connect and on-chain release are the next milestones."
            chip="Early access"
            chipColor="bg-[#ff4fb8] text-white"
            icon={<Hourglass className="h-4 w-4" />}
          />
          <Stat
            title="What's next"
            body="USDC escrow on Base, services + deals, public profile reputation. Payments stay USDC-only — no custom token."
            chip="Roadmap"
            chipColor="bg-[#38e7ff]"
            icon={<ArrowRight className="h-4 w-4" />}
          />
        </div>
      </section>
    </main>
  );
}

function Pillar({
  icon,
  color,
  title,
  text,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <article className="comic-card-soft bg-white p-5">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#140625] shadow-[3px_3px_0_#140625] ${color}`}
      >
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-black uppercase text-[#140625]">
        {title}
      </h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
        {text}
      </p>
    </article>
  );
}

function Step({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <li className="rounded-lg border-2 border-[#140625] bg-[#fff8ed] p-4 shadow-[4px_4px_0_#140625]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#140625] bg-[#ffdd3d] text-sm font-black text-[#140625] shadow-[2px_2px_0_#140625]">
        {n}
      </span>
      <h4 className="mt-3 text-base font-black uppercase">{title}</h4>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
        {text}
      </p>
    </li>
  );
}

function Stat({
  title,
  body,
  chip,
  chipColor,
  icon,
}: {
  title: string;
  body: string;
  chip: string;
  chipColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="comic-card-soft bg-white p-5">
      <span
        className={`comic-chip ${chipColor}`}
      >
        {icon}
        {chip}
      </span>
      <h3 className="mt-4 text-lg font-black uppercase">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5a3b66]">
        {body}
      </p>
    </div>
  );
}
