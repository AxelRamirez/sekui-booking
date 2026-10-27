import { addons as addonCatalog, type AddonId } from "@/lib/content/addons";
import type { BookingAddon, PriceLine, Quote } from "./types";

export function resolveAddons(addonIds: readonly AddonId[], guests: number): BookingAddon[] {
  return addonCatalog
    .filter((addon) => addonIds.includes(addon.id))
    .map((addon) => ({ id: addon.id, quantity: addon.unit === "person" ? guests : 1 }));
}

export interface QuoteInput {
  pricePerPerson: number;
  guests: number;
  addonIds: readonly AddonId[];
  extraFees?: number;
}

/** Pure price calculation, shared by the booking form (live preview) and the server. */
export function quote({ pricePerPerson, guests, addonIds, extraFees = 0 }: QuoteInput): Quote {
  const lines: PriceLine[] = [{ kind: "base", quantity: guests, unitAmount: pricePerPerson, amount: guests * pricePerPerson }];

  for (const selected of resolveAddons(addonIds, guests)) {
    const addon = addonCatalog.find((a) => a.id === selected.id)!;
    lines.push({
      kind: "addon",
      refId: addon.id,
      quantity: selected.quantity,
      unitAmount: addon.price,
      amount: selected.quantity * addon.price,
    });
  }

  if (extraFees > 0) lines.push({ kind: "reschedule_fee", quantity: 1, unitAmount: extraFees, amount: extraFees });

  return { lines, total: lines.reduce((sum, line) => sum + line.amount, 0) };
}
