import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ButtonLink } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { createTranslator, type TranslationKey } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

type NavLink =
  | {
      href: string;
      labelKey: TranslationKey;
      external?: boolean;
      soon?: never;
    }
  | {
      labelKey: TranslationKey;
      soon: true;
      href?: never;
      external?: never;
    };

const navLinks = [
  { href: "/tasks", labelKey: "nav.tasks" },
  { href: "/creators", labelKey: "nav.creators" },
  { href: "/about", labelKey: "nav.about" },
  {
    href: "https://t.me/+V78fuYlQNvcxYTNl",
    labelKey: "nav.telegram",
    external: true,
  },
  { href: "https://x.com/bountixofc", labelKey: "nav.x", external: true },
  { labelKey: "nav.discordSoon", soon: true },
] satisfies NavLink[];

/**
 * Read the current Supabase user without throwing if env vars are missing
 * (waitlist preview must keep rendering even before auth is fully wired).
 */
async function getCurrentUser() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

function getDisplayHandle(
  user: { email?: string | null } | null,
  fallback: string,
) {
  if (!user?.email) return fallback;
  const local = user.email.split("@")[0];
  return local.length > 14 ? `${local.slice(0, 13)}…` : local;
}

export async function SiteHeader() {
  const locale = await getRequestLocale();
  const t = createTranslator(locale);
  const user = await getCurrentUser();
  const displayHandle = getDisplayHandle(user, t("common.account"));

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#140625] bg-[#fffaf4]/95 backdrop-blur-xl">
      <div className="container-page py-3">
        <div className="flex min-h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Bountix home"
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-[#140625] bg-[#38e7ff] shadow-[4px_4px_0_#140625]">
              <Image
                src="/bountix-comic/bountix_assets_ready/bountix-app-icon.png"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </span>
            <span className="text-lg font-black uppercase text-[#140625]">
              Bountix
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.soon ? (
                <span
                  key={link.labelKey}
                  className="rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625]/55"
                >
                  {t(link.labelKey)}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-[#140625] transition hover:bg-[#38e7ff]"
                >
                  {t(link.labelKey)}
                </Link>
              ),
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <LanguageSwitcher
                locale={locale}
                className="hidden sm:inline-flex"
              />
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff] sm:inline-flex"
              >
                <User aria-hidden="true" className="h-4 w-4" />
                {displayHandle}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label={t("common.logout")}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:-translate-y-0.5 hover:bg-[#ff4fb8] hover:text-white"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("common.logout")}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LanguageSwitcher
                locale={locale}
                className="hidden sm:inline-flex"
              />
              <Link
                href="/login"
                className="hidden min-h-10 items-center rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff] sm:inline-flex"
              >
                {t("common.login")}
              </Link>
              <ButtonLink
                href="/waitlist"
                className="min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm"
              >
                {t("common.joinWaitlist")}
              </ButtonLink>
            </div>
          )}
        </div>
        <nav className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
          {navLinks.map((link) =>
            link.soon ? (
              <span
                key={link.labelKey}
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625]/55"
              >
                {t(link.labelKey)}
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
              >
                {t(link.labelKey)}
              </Link>
            ),
          )}
          {user ? (
            <Link
              href="/dashboard"
              className="shrink-0 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625]"
            >
              {displayHandle}
            </Link>
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
            >
              {t("common.login")}
            </Link>
          )}
          <LanguageSwitcher locale={locale} className="shrink-0 sm:hidden" />
        </nav>
      </div>
    </header>
  );
}
