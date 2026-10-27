import type { AvailabilityStatus, BookingStatus } from "@/lib/booking/types";

const tones: Record<AvailabilityStatus, string> = {
  available: "text-success border-success/40 bg-success/10",
  limited: "text-warning border-warning/40 bg-warning/10",
  sold_out: "text-danger border-danger/40 bg-danger/10",
  closed: "text-muted border-line bg-sunken",
};

export function AvailabilityBadge({ status, label }: { status: AvailabilityStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-control border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function StatusPill({ tone, children }: { tone: "success" | "warning" | "danger" | "muted"; children: React.ReactNode }) {
  const map = {
    success: tones.available,
    warning: tones.limited,
    danger: tones.sold_out,
    muted: tones.closed,
  };
  return (
    <span className={`inline-flex items-center rounded-control border px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
}

export const bookingStatusTone: Record<BookingStatus, "success" | "warning" | "danger" | "muted"> = {
  confirmed: "success",
  pending_payment: "warning",
  cancelled: "danger",
  expired: "muted",
};
