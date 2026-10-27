import type { AddonId } from "@/lib/content/addons";
import type { TourSlug } from "@/lib/content/tours";
import type { Locale } from "@/lib/i18n/config";

/** ISO calendar date, e.g. "2026-11-05". */
export type DateString = string;
/** ISO timestamp. */
export type Timestamp = string;

export type PaymentPlan = "full" | "deposit";
export type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "expired";
export type AvailabilityStatus = "available" | "limited" | "sold_out" | "closed";

/** A scheduled date for a tour. Admin-managed in the future (e.g. Supabase). */
export interface Departure {
  id: string;
  tourSlug: TourSlug;
  startDate: DateString;
  endDate: DateString;
  /** Maximum travelers for this departure. */
  capacity: number;
  /** Spots sold through other channels (seeded dummy occupancy). */
  blockedSpots: number;
  /** MXN per person, all inclusive. */
  pricePerPerson: number;
  isPeak: boolean;
  status: "scheduled" | "cancelled";
}

export interface LeadGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface Traveler {
  fullName: string;
  dietary: string;
}

export interface BookingAddon {
  id: AddonId;
  quantity: number;
}

export type PriceLineKind = "base" | "addon" | "reschedule_fee";

export interface PriceLine {
  kind: PriceLineKind;
  /** Addon id for addon lines. */
  refId?: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface Quote {
  lines: PriceLine[];
  total: number;
}

export type BookingEventType =
  | "created"
  | "payment_succeeded"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "refunded"
  | "expired";

export interface BookingEvent {
  at: Timestamp;
  type: BookingEventType;
  data?: Record<string, string | number>;
}

export interface Booking {
  code: string;
  accessToken: string;
  status: BookingStatus;
  locale: Locale;
  tourSlug: TourSlug;
  departureId: string;
  guests: number;
  leadGuest: LeadGuest;
  travelers: Traveler[];
  addons: BookingAddon[];
  notes: string;
  paymentPlan: PaymentPlan;
  quote: Quote;
  /** Fees that survive reschedules (e.g. date-change fees), MXN. */
  extraFees: number;
  holdExpiresAt: Timestamp | null;
  rescheduleCount: number;
  history: BookingEvent[];
  createdAt: Timestamp;
  confirmedAt: Timestamp | null;
  cancelledAt: Timestamp | null;
  isDemo?: boolean;
}

export type PaymentPurpose = "initial" | "balance";
export type PaymentStatus = "pending" | "succeeded" | "expired" | "failed";

export interface Payment {
  id: string;
  bookingCode: string;
  purpose: PaymentPurpose;
  /** MXN */
  amount: number;
  refundedAmount: number;
  status: PaymentStatus;
  provider: "stripe" | "simulated";
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  createdAt: Timestamp;
  paidAt: Timestamp | null;
}

export interface Installment {
  key: "full" | "deposit" | "balance";
  dueDate: DateString;
  amount: number;
}

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  html: string;
  bookingCode: string | null;
  createdAt: Timestamp;
}

export type InquiryKind = "general" | "private_group" | "custom_dates";

export interface Inquiry {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  groupSize: number;
  preferredDates: string;
  message: string;
  createdAt: Timestamp;
}

export interface Subscriber {
  email: string;
  locale: Locale;
  createdAt: Timestamp;
}
