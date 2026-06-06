import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ButtonLink } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { createTranslator, type TranslationKey } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUnreadNotificationCount } from "@/lib/notifications";

type NavLink = {
  href: string;
  labelKey: TranslationKey;
  external?: boolean;
};

const guestNavLinks = [
  { href: "/tasks", labelKey: "common.browseTasks" },
  { href: "/about", labelKey: "nav.about" },
] satisfies NavLink[];

const authedNavLinks = [
  { href: "/dashboard", labelKey: "common.dashboard" },
  { href: "/post-task", labelKey: "common.postTask" },
  { href: "/tasks", labelKey: "common.tasks" },
  { href: "/notifications", labelKey: "common.notifications" },
  { href: "/dashboard/profile", labelKey: "dashboard.nav.profile" },
] satisfies NavLink[];

/**
 * Read the current Supabase user without throwing if env vars are missing
 * (public pages must keep rendering even before auth is fully wired).
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
  const unreadCount = user ? await getUnreadNotificationCount() : 0;
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const navLinks: NavLink[] = user ? authedNavLinks : guestNavLinks;

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="rounded-lg px-3 py-2 text-sm font-bold text-[#140625] transition hover:bg-[#38e7ff]"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <LanguageSwitcher
                locale={locale}
                className="hidden sm:inline-flex"
              />
              <Link
                href="/notifications"
                aria-label={t("notifications.bellLabel")}
                className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border-2 border-[#140625] bg-white px-2 py-2 text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
              >
                <Bell aria-hidden="true" className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-2 -top-2 min-w-6 rounded-full border-2 border-[#140625] bg-[#ff4fb8] px-1.5 py-0.5 text-center text-[0.65rem] font-black leading-none text-white">
                    {unreadLabel}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-xs font-black uppercase text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff] sm:inline-flex"
              >
                <User aria-hidden="true" className="h-4 w-4" />
                {t("common.dashboard")}
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
                href="/signup"
                className="min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm"
              >
                {t("common.joinWaitlist")}
              </ButtonLink>
            </div>
          )}
        </div>
        <nav className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard/profile"
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-[#38e7ff] px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625]"
              >
                {displayHandle}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
              >
                {t("common.login")}
              </Link>
              <Link
                href="/signup"
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-[#ffdd3d] px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
              >
                {t("common.joinWaitlist")}
              </Link>
            </>
          )}
          <LanguageSwitcher locale={locale} className="shrink-0 sm:hidden" />
        </nav>
      </div>
    </header>
  );
}
