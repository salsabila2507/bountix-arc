import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="container-page relative z-20 flex h-20 items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="Bountix home">
        <span className="relative h-10 w-10 overflow-hidden rounded-lg border border-cyan-200/15 bg-white/[0.04] shadow-aurora-soft">
          <Image
            src="/logo.png"
            alt=""
            fill
            sizes="40px"
            className="object-cover"
            priority
          />
        </span>
        <span className="bg-gradient-to-r from-white via-cyan-100 to-aurora-300 bg-clip-text text-sm font-semibold tracking-[0.16em] text-transparent">
          Bountix
        </span>
      </Link>
      <ButtonLink href="/waitlist" className="hidden min-h-10 px-4 py-2 sm:inline-flex">
        Join Waitlist
      </ButtonLink>
    </header>
  );
}
