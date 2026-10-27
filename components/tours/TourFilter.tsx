"use client";

import { useState } from "react";

/** Category chips over a server-rendered grid of tour cards. */
export function TourFilter({
  items,
  labels,
}: {
  items: { key: string; category: string; card: React.ReactNode }[];
  labels: Record<string, string> & { all: string };
}) {
  const [category, setCategory] = useState("all");
  const categories = ["all", ...new Set(items.map((item) => item.category))];

  return (
    <>
      <div className="mb-10 flex flex-wrap justify-center gap-2" role="group">
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            aria-pressed={category === key}
            className={`rounded-control border px-4 py-2 text-sm transition ${
              category === key ? "border-accent bg-accent text-accent-fg" : "border-line hover:border-fg"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter((item) => category === "all" || item.category === category)
          .map((item) => (
            <div key={item.key}>{item.card}</div>
          ))}
      </div>
    </>
  );
}
