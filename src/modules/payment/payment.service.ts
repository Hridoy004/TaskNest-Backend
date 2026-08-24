import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IJwtPayload } from "../booking/booking.interface";
import { ICreatePayment } from "./payment.interface";
import { handleCheckoutCompleted } from "./payment.utils";

const stripe = new Stripe(config.stripe_secret_key as string);

const createCheckoutSessionIntoDB = async (
  payload: ICreatePayment,
  user: IJwtPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== user.id) {
    throw new Error("You are not allowed to pay for this booking");
  }

  if (booking.status !== "ACCEPTED") {
    throw new Error("Booking must be accepted before payment");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: {
      bookingId: booking.id,
    },
  });

  if (existingPayment) {
    throw new Error("Payment already exists for this booking");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: "bdt",

          unit_amount: Math.round(booking.totalAmount * 100),

          product_data: {
            name: booking.service.title,
            description: booking.service.description,
          },
        },
      },
    ],

    success_url: `${config.app_url}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${config.app_url}/dashboard/payment/cancel`,

    metadata: {
      bookingId: booking.id,
      customerId: user.id,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      provider: "STRIPE",
      paymentIntent: session.payment_intent?.toString(),
      transactionId: session.id,
      status: "PENDING",
    },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret as string;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;

    default:
      console.log(`Unhandled event: ${event.type}`);
      break;
  }

  return {
    received: true,
  };
};

const getMyPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getPaymentDetails = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (payment.booking.customerId !== userId) {
    throw new Error("You are not authorized to access this payment");
  }

  return payment;
};

export const paymentService = {
  createCheckoutSessionIntoDB,
  handleWebhook,
  getMyPayments,
  getPaymentDetails,
};
