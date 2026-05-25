import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="container-page relative z-20 flex h-20 items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="TaskOps home">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-acid-400/40 bg-acid-400/10 text-sm font-black text-acid-300">
          T
        </span>
        <span className="text-sm font-semibold tracking-[0.16em] text-white/86">
          TASKOPS
        </span>
      </Link>
      <ButtonLink href="/waitlist" className="hidden min-h-10 px-4 py-2 sm:inline-flex">
        Join Waitlist
      </ButtonLink>
    </header>
  );
}
