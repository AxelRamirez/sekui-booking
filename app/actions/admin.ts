"use server";

import { redirect } from "next/navigation";
import { resetDb } from "@/lib/db/store";
import { hasLocale } from "@/lib/i18n/config";
import { localePath, routes } from "@/lib/i18n/paths";

/** Demo-only: restores the sample bookings and clears everything else. */
export async function resetDemoData(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale"));
  await resetDb();
  redirect(`${localePath(hasLocale(locale) ? locale : "en", routes.admin)}?notice=reset`);
}
