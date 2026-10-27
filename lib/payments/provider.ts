import "server-only";
import Stripe from "stripe";
import { policies } from "@/lib/booking/policies";
import type { Locale } from "@/lib/i18n/config";

let client: Stripe | null = null;

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Lazily created so builds without keys still work. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
      console.warn("[stripe] This demo is meant for sandbox keys (sk_test_…).");
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      appInfo: { name: "sekui-booking-app" },
    });
  }
  return client;
}

export interface CheckoutRequest {
  paymentId: string;
  bookingCode: string;
  /** MXN */
  amount: number;
  customerEmail: string;
  productName: string;
  productDescription: string;
  locale: Locale;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string | null;
}

export async function createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResult> {
  if (!isStripeEnabled()) {
    const url = new URL(request.successUrl);
    url.pathname = `/${request.locale}/checkout/simulated`;
    url.search = new URLSearchParams({ payment: request.paymentId }).toString();
    return { url: url.toString(), sessionId: null };
  }

  const metadata = { bookingCode: request.bookingCode, paymentId: request.paymentId };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    locale: request.locale,
    customer_email: request.customerEmail,
    client_reference_id: request.bookingCode,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(request.amount * 100),
          product_data: { name: request.productName, description: request.productDescription },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata, description: `${request.bookingCode} · ${request.productName}` },
    // Stripe requires at least 30 minutes; it matches our inventory hold.
    expires_at: Math.floor(Date.now() / 1000) + policies.holdMinutes * 60,
    success_url: `${request.successUrl}${request.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: request.cancelUrl,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url, sessionId: session.id };
}

export interface CheckoutStatus {
  paymentId: string | null;
  paid: boolean;
  expired: boolean;
  paymentIntentId: string | null;
}

export async function retrieveCheckoutStatus(sessionId: string): Promise<CheckoutStatus> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  return fromSession(session);
}

export function fromSession(session: Stripe.Checkout.Session): CheckoutStatus {
  const paymentIntent = session.payment_intent;
  return {
    paymentId: session.metadata?.paymentId ?? null,
    paid: session.payment_status === "paid",
    expired: session.status === "expired",
    paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : (paymentIntent?.id ?? null),
  };
}

/** Refunds part of a Stripe payment. Simulated payments are refunded on paper only. */
export async function refundProviderPayment(input: {
  provider: "stripe" | "simulated";
  paymentIntentId: string | null;
  amount: number;
  bookingCode: string;
}): Promise<void> {
  if (input.provider !== "stripe" || !input.paymentIntentId || !isStripeEnabled()) return;
  await getStripe().refunds.create({
    payment_intent: input.paymentIntentId,
    amount: Math.round(input.amount * 100),
    metadata: { bookingCode: input.bookingCode },
  });
}

export function constructWebhookEvent(payload: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}
