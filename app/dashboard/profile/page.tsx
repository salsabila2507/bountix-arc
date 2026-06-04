import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Edit3,
  Globe,
  Hourglass,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_LANGUAGE_LABEL,
  PROFILE_ROLE_LABEL,
  type Profile,
  type ProfileLanguage,
  type ProfileRole,
  type SocialLinks,
} from "@/lib/profile";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Profile",
  description: "Your Bountix profile, status, and early-access gate.",
};

async function getSessionAndProfile(): Promise<
  { profile: Profile } | { profile: null }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null };

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, bio, avatar_url, role, skills, wallet_address, social_links, preferred_language, can_use_platform, is_early_contributor, created_at, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return { profile: null };
  return {
    profile: {
      ...data,
      role: data.role as ProfileRole,
      preferred_language: data.preferred_language as ProfileLanguage,
      social_links: (data.social_links ?? {}) as SocialLinks,
      skills: data.skills ?? [],
    } as Profile,
  };
}

export default async function DashboardProfilePage() {
  const { profile } = await getSessionAndProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "admin";
  const canUse = profile.can_use_platform || isAdmin;

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="comic-chip bg-[#ffdd3d]">Your dashboard</p>
            <h1 className="mt-3 text-3xl font-black uppercase leading-none sm:text-5xl">
              Hi, @{profile.username}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/profile/${profile.username}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
            >
              View public profile
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/profile/edit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-[#140625] bg-[#ff4fb8] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#7c3cff]"
            >
              <Edit3 aria-hidden="true" className="h-4 w-4" />
              Edit profile
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-8">
            <div className="halftone-mask absolute -right-10 -top-10 h-40 w-40 opacity-20" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-[#140625] bg-[#ffdd3d] shadow-[5px_5px_0_#140625]">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-black text-[#140625]">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <div>
                <p className="text-sm font-bold text-[#7c3cff]">
                  @{profile.username}
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#140625] sm:text-3xl">
                  {profile.display_name ?? `@${profile.username}`}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 py-1 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                    <BadgeCheck
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    {PROFILE_ROLE_LABEL[profile.role]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-white px-3 py-1 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                    <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                    {PROFILE_LANGUAGE_LABEL[profile.preferred_language]}
                  </span>
                  {profile.is_early_contributor ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#f1d8ff] px-3 py-1 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                      <BadgeCheck
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-[#7c3cff]"
                      />
                      Early Contributor
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-6 whitespace-pre-line text-sm font-semibold leading-7 text-[#3c214b]">
              {profile.bio ?? "No bio yet. Tap Edit profile to add one."}
            </p>

            {profile.skills.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xs font-black uppercase text-[#5a3b66]">
                  Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border-2 border-[#140625] bg-white px-3 py-1.5 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <aside className="grid h-fit gap-4">
            <div
              className={`comic-card-soft p-5 ${
                canUse ? "bg-[#dff7e6]" : "bg-[#f2e6ff]"
              }`}
            >
              <div className="flex items-center gap-2">
                {canUse ? (
                  <BadgeCheck
                    aria-hidden="true"
                    className="h-5 w-5 text-[#1f6b3a]"
                  />
                ) : (
                  <Hourglass
                    aria-hidden="true"
                    className="h-5 w-5 text-[#7c3cff]"
                  />
                )}
                <h2 className="text-lg font-black text-[#140625]">
                  {canUse ? "Full access" : "Early access pending"}
                </h2>
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-[#3c214b]">
                {canUse
                  ? "You can create tasks, apply, submit work, and offer services once those features go live."
                  : "Your profile is set. Posting tasks, applying, submitting work, and offering services will unlock when Bountix opens early access for you."}
              </p>
              {isAdmin ? (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border-2 border-[#140625] bg-white px-2 py-0.5 text-[0.65rem] font-black uppercase text-[#140625] shadow-[2px_2px_0_#140625]">
                  Admin bypass active
                </p>
              ) : null}
            </div>

            <div className="comic-card-soft bg-[#fffaf4] p-5">
              <div className="flex items-center gap-2">
                <Coins aria-hidden="true" className="h-5 w-5 text-[#7c3cff]" />
                <h2 className="text-lg font-black text-[#140625]">
                  Payments
                </h2>
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-[#5a3b66]">
                USDC on Base is the payment direction. Wallet connect and
                escrow are coming.
              </p>
            </div>

            <div className="comic-card-soft bg-white p-5">
              <div className="flex items-center gap-2">
                <Wallet
                  aria-hidden="true"
                  className="h-5 w-5 text-[#7c3cff]"
                />
                <h2 className="text-lg font-black text-[#140625]">Wallet</h2>
              </div>
              <p className="mt-2 break-all text-sm font-semibold leading-6 text-[#3c214b]">
                {profile.wallet_address ?? "Not connected."}
              </p>
              <p className="mt-2 text-xs font-bold text-[#5a3b66]">
                Address is informational only.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
