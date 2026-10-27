"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface NavLink {
  href: string;
  label: string;
}

export function MobileMenu({
  links,
  menuLabel,
  closeLabel,
  footer,
}: {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        aria-expanded={open}
        className="flex size-10 items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={menuLabel} className="fixed inset-0 z-50 flex flex-col bg-bg text-fg">
          <div className="container-page flex h-16 items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="flex size-10 items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav className="container-page flex flex-1 flex-col gap-1 overflow-y-auto pb-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="heading border-b border-line py-4 text-3xl"
              >
                {link.label}
              </Link>
            ))}
            {footer && <div className="mt-8">{footer}</div>}
          </nav>
        </div>
      )}
    </div>
  );
}
