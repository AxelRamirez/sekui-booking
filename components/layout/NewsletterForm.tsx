"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/actions/leads";
import { initialFormState } from "@/app/actions/form-state";
import type { Locale } from "@/lib/i18n/config";

/** Rounded email field with an arrow button, for the dark footer. */
export function NewsletterForm({ locale, placeholder, submitLabel }: { locale: Locale; placeholder: string; submitLabel: string }) {
  const [state, action, pending] = useActionState(subscribe, initialFormState);

  if (state.status === "success") {
    return <p className="font-medium">{state.message}</p>;
  }

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex items-center gap-2 rounded-full border border-current/25 p-1 pl-5">
        <input
          type="email"
          name="email"
          required
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-current/50"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={submitLabel}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg text-fg"
        >
          ↗
        </button>
      </div>
      {state.status === "error" && <p className="text-sm text-highlight">{state.message}</p>}
    </form>
  );
}
