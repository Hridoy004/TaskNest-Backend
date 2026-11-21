import { ReviewWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IJwtPayload } from "../booking/booking.interface";
import { ICreateReview, IReviewQuery } from "./review.interface";

const createReviewIntoDB = async (
  payload: ICreateReview,
  user: IJwtPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== user.id) {
    throw new Error("You are not allowed to review this booking");
  }

  if (booking.status !== "COMPLETED") {
    throw new Error("Review can only be submitted after job completion");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      bookingId: payload.bookingId,
    },
  });

  if (existingReview) {
    throw new Error("Review already submitted");
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const result = await prisma.review.create({
    data: {
      bookingId: payload.bookingId,
      customerId: user.id,
      technicianId: booking.technicianId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  const ratings = await prisma.review.aggregate({
    where: {
      technicianId: booking.technicianId,
    },
    _avg: {
      rating: true,
    },
  });

  await prisma.technicianProfile.update({
    where: {
      id: booking.technicianId,
    },
    data: {
      averageRating: ratings._avg.rating || 0,
    },
  });

  return result;
};

const getAllReviewsFromDB = async (query: IReviewQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: ReviewWhereInput[] = [];

  if (query.technicianId) {
    andConditions.push({
      technicianId: query.technicianId,
    });
  }

  if (query.bookingId) {
    andConditions.push({
      bookingId: query.bookingId,
    });
  }

  if (query.rating) {
    andConditions.push({
      rating: Number(query.rating),
    });
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        AND: andConditions,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        customer: {
          omit: {
            password: true,
          },
        },
        technician: {
          include: {
            user: {
              omit: {
                password: true,
              },
            },
          },
        },
        booking: true,
      },
    }),
    prisma.review.count({
      where: {
        AND: andConditions,
      },
    }),
  ]);

  return {
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const reviewService = {
  createReviewIntoDB,
  getAllReviewsFromDB,
};
