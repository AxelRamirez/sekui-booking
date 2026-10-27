"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/app/actions/leads";
import { initialFormState } from "@/app/actions/form-state";
import type { InquiryKind } from "@/lib/booking/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const KINDS: InquiryKind[] = ["general", "private_group", "custom_dates"];

export function InquiryForm({ locale, copy }: { locale: Locale; copy: Dictionary["contact"]["form"] }) {
  const [state, action, pending] = useActionState(submitInquiry, initialFormState);

  if (state.status === "success") {
    return <p className="card p-8 text-center text-lg font-medium text-success">{state.message}</p>;
  }

  const error = (field: string) =>
    state.fieldErrors?.[field] ? <span className="mt-1 block text-sm text-danger">{state.fieldErrors[field]}</span> : null;

  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      <p className="heading text-2xl sm:col-span-2">{copy.title}</p>
      <label className="sm:col-span-2">
        <span className="label">{copy.kind}</span>
        <select name="kind" defaultValue="general" className="field">
          {KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {copy.kinds[kind]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">{copy.name}</span>
        <input name="name" required className="field" autoComplete="name" />
        {error("name")}
      </label>
      <label>
        <span className="label">{copy.email}</span>
        <input name="email" type="email" required className="field" autoComplete="email" />
        {error("email")}
      </label>
      <label>
        <span className="label">{copy.groupSize}</span>
        <input name="groupSize" type="number" min={1} max={200} defaultValue={2} required className="field" />
        {error("groupSize")}
      </label>
      <label>
        <span className="label">{copy.dates}</span>
        <input name="preferredDates" className="field" />
      </label>
      <label className="sm:col-span-2">
        <span className="label">{copy.message}</span>
        <textarea name="message" rows={4} className="field" />
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {copy.submit}
        </button>
      </div>
    </form>
  );
}
