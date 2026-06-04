import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  Send,
  Sparkles,
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

type RouteParams = { params: Promise<{ username: string }> };

export const dynamic = "force-dynamic";

async function fetchProfile(username: string): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, role, skills, wallet_address, social_links, preferred_language, can_use_platform, is_early_contributor, created_at, updated_at",
      )
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...data,
      role: data.role as ProfileRole,
      preferred_language: data.preferred_language as ProfileLanguage,
      social_links: (data.social_links ?? {}) as SocialLinks,
      skills: data.skills ?? [],
    } as Profile;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: RouteParams) {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) return { title: `@${username}` };
  return {
    title: profile.display_name
      ? `${profile.display_name} (@${profile.username})`
      : `@${profile.username}`,
    description:
      profile.bio ??
      `${PROFILE_ROLE_LABEL[profile.role]} on Bountix.`,
  };
}

export default async function PublicProfilePage({ params }: RouteParams) {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) {
    notFound();
  }

  const social = profile.social_links;
  const displayName = profile.display_name ?? `@${profile.username}`;

  return (
    <main className="comic-page min-h-screen overflow-hidden text-[#140625]">
      <SiteHeader />
      <section className="container-page py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-black text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back home
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="comic-card relative overflow-hidden bg-[#fff8ed] p-6 sm:p-8">
            <div className="halftone-mask absolute -right-10 -top-10 h-40 w-40 opacity-20" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
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
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-[#140625] sm:text-4xl">
                    {displayName}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 py-1.5 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                  <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  {PROFILE_ROLE_LABEL[profile.role]}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-white px-3 py-1.5 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                  <Globe aria-hidden="true" className="h-3.5 w-3.5" />
                  {PROFILE_LANGUAGE_LABEL[profile.preferred_language]}
                </span>
                {profile.is_early_contributor ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#f1d8ff] px-3 py-1.5 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625]">
                    <BadgeCheck
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-[#7c3cff]"
                    />
                    Early Contributor
                  </span>
                ) : null}
              </div>
            </div>

            {profile.bio ? (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-base font-semibold leading-7 text-[#3c214b]">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-6 text-sm font-bold leading-6 text-[#5a3b66]">
                No bio yet.
              </p>
            )}

            {profile.skills.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-xs font-black uppercase text-[#5a3b66]">
                  Skills
                </h2>
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
            <div className="comic-card-soft bg-white p-5">
              <h2 className="text-lg font-black text-[#140625]">Links</h2>
              <div className="mt-4 grid gap-2 text-sm font-bold">
                <SocialRow label="X" href={social.x} icon="x" />
                <SocialRow
                  label="Telegram"
                  href={social.telegram}
                  icon="telegram"
                />
                <SocialRow label="GitHub" href={social.github} icon="github" />
                <SocialRow
                  label="Website"
                  href={social.website}
                  icon="website"
                />
                {!social.x &&
                !social.telegram &&
                !social.github &&
                !social.website ? (
                  <p className="text-sm font-bold leading-6 text-[#5a3b66]">
                    No public links yet.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="comic-card-soft bg-[#fffaf4] p-5">
              <div className="flex items-center gap-2">
                <Wallet
                  aria-hidden="true"
                  className="h-5 w-5 text-[#7c3cff]"
                />
                <h2 className="text-lg font-black text-[#140625]">
                  Wallet (Base)
                </h2>
              </div>
              <p className="mt-3 break-all text-sm font-semibold leading-6 text-[#3c214b]">
                {profile.wallet_address ?? "Not connected."}
              </p>
              <p className="mt-3 text-xs font-bold leading-5 text-[#5a3b66]">
                Wallet connect and on-chain transfer are not live yet. USDC on
                Base is coming.
              </p>
            </div>

            <div className="comic-card-soft bg-[#f2e6ff] p-5">
              <Sparkles
                aria-hidden="true"
                className="h-5 w-5 text-[#7c3cff]"
              />
              <h2 className="mt-3 text-lg font-black text-[#140625]">
                Joined Bountix
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#5a3b66]">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SocialRow({
  label,
  href,
  icon,
}: {
  label: string;
  href?: string;
  icon: "x" | "telegram" | "github" | "website";
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-between gap-3 rounded-lg border-2 border-[#140625] bg-[#fffaf4] px-3 py-2 font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
    >
      <span className="inline-flex items-center gap-2">
        {icon === "telegram" ? (
          <Send aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
        ) : (
          <Globe aria-hidden="true" className="h-4 w-4 text-[#7c3cff]" />
        )}
        {label}
      </span>
      <span className="text-xs font-bold normal-case text-[#7c3cff]">Open</span>
    </a>
  );
}
