import type { Locale } from "../config";
import en, { type Dictionary } from "./en";
import es from "./es";
import fr from "./fr";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, es, fr };

/** Safe to use anywhere on the server (actions, route handlers, emails). */
export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
