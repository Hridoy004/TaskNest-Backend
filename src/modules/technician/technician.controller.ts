import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { technicianService } from "./technician.service";

const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await technicianService.getAllTechniciansFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technicians retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const technicianController = {
  getAllTechnicians,
};
