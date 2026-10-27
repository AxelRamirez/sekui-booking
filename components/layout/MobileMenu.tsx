"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface NavLink {
  href: string;
  label: string;
}

export function MobileMenu({
  links,
  menuLabel,
  closeLabel,
  brand,
  footer,
}: {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
  /** Logo shown at the top of the open menu. */
  brand?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
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
      {/* Portal to <body>: the sticky header uses backdrop-filter, which would
          otherwise become the containing block of this fixed overlay. */}
      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label={menuLabel} className="fixed inset-0 z-[60] flex h-dvh flex-col bg-bg text-fg">
            <div className="container-page flex h-18 shrink-0 items-center justify-between">
              <div onClick={() => setOpen(false)}>{brand}</div>
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
          </div>,
          document.body,
        )}
    </div>
  );
}
