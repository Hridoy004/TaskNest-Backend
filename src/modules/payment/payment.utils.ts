import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.log("Webhook: Missing bookingId");
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: {
      bookingId,
    },
  });

  if (!payment) {
    console.log(`Webhook: Payment not found for booking ${bookingId}`);
    return;
  }

  if (payment.status === "PAID") {
    console.log(`Webhook: Payment already completed`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        bookingId,
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transactionId: session.id,
        paymentIntent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
      },
    });

    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "PAID",
      },
    });
  });

  console.log(`Payment successful for booking ${bookingId}`);
};
