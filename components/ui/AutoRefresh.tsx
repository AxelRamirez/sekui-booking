"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-renders the current route periodically (e.g. while a payment is confirming). */
export function AutoRefresh({ intervalMs = 3000, maxAttempts = 10 }: { intervalMs?: number; maxAttempts?: number }) {
  const router = useRouter();
  useEffect(() => {
    let attempts = 0;
    const id = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) clearInterval(id);
      else router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs, maxAttempts]);
  return null;
}
