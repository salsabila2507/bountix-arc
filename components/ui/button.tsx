import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export function ButtonLink({
  href,
  children,
  className,
  target,
  rel,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-cyan-200/20 bg-gradient-to-r from-aurora-600 via-aurora-500 to-aurora-300 px-5 py-3 text-sm font-semibold text-white shadow-aurora-violet transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-aurora-300 focus:ring-offset-2 focus:ring-offset-graphite-950",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}
