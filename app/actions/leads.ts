"use server";

import { z } from "zod";
import { addInquiry, addSubscriber } from "@/lib/booking/service";
import { hasLocale, type Locale } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
import type { FormState } from "./form-state";

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "");
  return hasLocale(value) ? value : "en";
}

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const t = dictionaryFor(locale);
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { status: "error", message: t.booking.errors.email };

  await addSubscriber(email.data, locale);
  return { status: "success", message: t.footer.newsletter.success };
}

const inquirySchema = z.object({
  kind: z.enum(["general", "private_group", "custom_dates"]),
  name: z.string().trim().min(2),
  email: z.email(),
  groupSize: z.coerce.number().int().min(1).max(200),
  preferredDates: z.string().trim().max(200),
  message: z.string().trim().max(2000),
});

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const t = dictionaryFor(localeFrom(formData));
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      fieldErrors[field] = field === "email" ? t.booking.errors.email : t.booking.errors.required;
    }
    return { status: "error", fieldErrors };
  }

  await addInquiry(parsed.data);
  return { status: "success", message: t.contact.form.success };
}
