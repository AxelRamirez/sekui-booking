"use client";

import { useActionState } from "react";
import { findMyTrip } from "@/app/actions/booking";
import { initialFormState } from "@/app/actions/form-state";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LookupForm({ locale, copy }: { locale: Locale; copy: Dictionary["myTrip"]["lookup"] }) {
  const [state, action, pending] = useActionState(findMyTrip, initialFormState);

  return (
    <form action={action} className="card flex flex-col gap-4 p-6 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <label>
        <span className="label">{copy.code}</span>
        <input name="code" required placeholder={copy.codePlaceholder} className="field font-mono uppercase" autoComplete="off" />
      </label>
      <label>
        <span className="label">{copy.email}</span>
        <input name="email" type="email" required className="field" autoComplete="email" />
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {copy.submit}
      </button>
      <p className="text-center text-xs text-muted">{copy.demoHint}</p>
    </form>
  );
}
