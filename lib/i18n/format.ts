import { intlLocales, type Locale } from "./config";

type Vars = Record<string, string | number>;

/** Replaces `{name}` placeholders in a dictionary string. */
export function fill(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Chooses the singular/plural variant and fills `{count}`. */
export function plural(forms: { one: string; other: string }, count: number, locale: Locale): string {
  const rule = new Intl.PluralRules(intlLocales[locale]).select(count);
  return fill(rule === "one" ? forms.one : forms.other, { count });
}

export function formatMoney(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "currency",
    currency: "MXN",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Business timezone for timestamps (calendar dates are timezone-free). */
const BUSINESS_TIME_ZONE = "America/Mazatlan";

/** Formats an ISO date ("2026-11-05") or a timestamp. */
export function formatDate(
  value: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const isCalendarDate = value.length === 10;
  const date = isCalendarDate ? new Date(`${value}T00:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat(intlLocales[locale], {
    timeZone: isCalendarDate ? "UTC" : BUSINESS_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDateRange(start: string, end: string, locale: Locale): string {
  const format = new Intl.DateTimeFormat(intlLocales[locale], {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return format.formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));
}

export function formatMonth(monthKey: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00Z`));
}

/** Month name for a 1-12 month number (static, no current date involved). */
export function monthName(month: number, locale: Locale, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(intlLocales[locale], { timeZone: "UTC", month: style }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

/** Season label from month numbers, e.g. [10,11,12,1,2] → "Oct – Feb". The season year starts in October. */
export function seasonLabel(months: number[], locale: Locale): string {
  const order = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const runs: number[][] = [];
  for (const month of order) {
    if (!months.includes(month)) continue;
    const last = runs.at(-1);
    if (last && order.indexOf(last.at(-1)!) === order.indexOf(month) - 1) last.push(month);
    else runs.push([month]);
  }
  const short = (m: number) => monthName(m, locale, "short").replace(".", "");
  return runs.map((run) => (run.length > 1 ? `${short(run[0])} – ${short(run.at(-1)!)}` : short(run[0]))).join(", ");
}
