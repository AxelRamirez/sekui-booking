import { markPaymentClosed, markPaymentSucceeded } from "@/lib/booking/service";
import { notifyPayment } from "@/lib/payments/checkout";
import { constructWebhookEvent, fromSession } from "@/lib/payments/provider";

/**
 * Stripe → app notifications. Locally:
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    event = constructWebhookEvent(await request.text(), signature);
  } catch (error) {
    console.error("[webhook] signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  const origin = new URL(request.url).origin;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const status = fromSession(event.data.object);
      if (status.paymentId && status.paid) {
        await notifyPayment(await markPaymentSucceeded(status.paymentId, status.paymentIntentId), origin);
      }
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const status = fromSession(event.data.object);
      if (status.paymentId) {
        await markPaymentClosed(status.paymentId, event.type === "checkout.session.expired" ? "expired" : "failed");
      }
      break;
    }
  }

  return Response.json({ received: true });
}
