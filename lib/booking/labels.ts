import { getAddon } from "@/lib/content/addons";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";
import type { PriceLine } from "./types";

export function priceLineLabel(line: PriceLine, templates: Dictionary["booking"]["priceLines"], locale: Locale): string {
  const name = line.refId ? (getAddon(line.refId)?.name[locale] ?? line.refId) : "";
  return fill(templates[line.kind], { quantity: line.quantity, name });
}
