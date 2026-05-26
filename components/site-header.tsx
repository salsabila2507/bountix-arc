import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

type NavLink =
  | {
      href: string;
      label: string;
      external?: boolean;
      soon?: never;
    }
  | {
      label: string;
      soon: true;
      href?: never;
      external?: never;
    };

const navLinks = [
  { href: "/tasks", label: "Tasks" },
  { href: "/creators", label: "Creators" },
  {
    href: "https://t.me/+V78fuYlQNvcxYTNl",
    label: "Telegram",
    external: true,
  },
  { href: "https://x.com/bountixofc", label: "X", external: true },
  { label: "Discord soon", soon: true },
] satisfies NavLink[];

export function SiteHeader() {
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
              link.soon ? (
                <span
                  key={link.label}
                  className="rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625]/55"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-[#140625] transition hover:bg-[#38e7ff]"
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          <ButtonLink
            href="/waitlist"
            className="min-h-10 px-3 py-2 text-xs sm:px-4 sm:text-sm"
          >
            Join Waitlist
          </ButtonLink>
        </div>
        <nav className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden">
          {navLinks.map((link) => (
            link.soon ? (
              <span
                key={link.label}
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625]/55"
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="shrink-0 rounded-lg border-2 border-[#140625] bg-white px-3 py-2 text-sm font-bold text-[#140625] shadow-[3px_3px_0_#140625] transition hover:bg-[#38e7ff]"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>
      </div>
    </header>
  );
}
