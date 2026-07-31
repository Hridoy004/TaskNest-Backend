import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IJwtPayload } from "../booking/booking.interface";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await reviewService.createReviewIntoDB(
      req.body,
      req.user as IJwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully",
      data: result,
    });
  },
);

const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await reviewService.getAllReviewsFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const reviewController = {
  createReview,
  getAllReviews,
};
