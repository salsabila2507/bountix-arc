import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function ButtonLink({ href, children, className }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-acid-400/40 bg-acid-400 px-5 py-3 text-sm font-semibold text-graphite-950 shadow-acid-soft transition hover:bg-acid-300 focus:outline-none focus:ring-2 focus:ring-acid-300 focus:ring-offset-2 focus:ring-offset-graphite-950",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}
