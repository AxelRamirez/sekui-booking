import Link from "next/link";
import { site } from "@/lib/content/site";

export function Logo({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8 text-accent" aria-hidden>
        <path d="M16 3 4 15h4v12h16V15h4L16 3z" fill="currentColor" />
        <path d="M13 27v-7h6v7" fill="var(--highlight)" />
      </svg>
      <span className="font-display text-2xl font-semibold tracking-tight lowercase">{site.name}</span>
    </Link>
  );
}
