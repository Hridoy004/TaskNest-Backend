import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IJwtPayload } from "../booking/booking.interface";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.createCheckoutSessionIntoDB(
      req.body,
      req.user as IJwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Checkout session created successfully",
      data: result,
    });
  },
);

const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    const result = await paymentService.handleWebhook(req.body, signature);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook triggered successfully",
      data: result,
    });
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.getMyPayments(req.user!.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history retrieved successfully",
      data: result,
    });
  },
);

const getPaymentDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const paymentId = req.params.id;

    const result = await paymentService.getPaymentDetails(
      paymentId as string,
      req.user!.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details retrieved successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createCheckoutSession,
  confirmPayment,
  getMyPayments,
  getPaymentDetails,
};
