import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreateBooking,
  IJwtPayload,
  IUpdateBookingStatus,
} from "./booking.interface";

const createBookingIntoDB = async (payload: ICreateBooking, userId: string) => {
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },
    include: {
      technician: true,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (!service.technician.isAvailable) {
    throw new Error("Technician is currently unavailable");
  }

  const result = await prisma.booking.create({
    data: {
      customerId: userId,
      technicianId: service.technician.id,
      serviceId: service.id,
      bookingDate: new Date(payload.bookingDate),
      totalAmount: service.price,
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
      service: true,
    },
  });

  return result;
};

const getMyBookingsFromDB = async (user: IJwtPayload) => {
  let whereCondition = {};

  if (user.role === Role.CUSTOMER) {
    whereCondition = {
      customerId: user.id,
    };
  } else if (user.role === Role.TECHNICIAN) {
    const technician = await prisma.technicianProfile.findUniqueOrThrow({
      where: {
        userId: user.id,
      },
    });

    whereCondition = {
      technicianId: technician.id,
    };
  }

  const bookings = await prisma.booking.findMany({
    where: whereCondition,

    orderBy: {
      createdAt: "desc",
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

      service: {
        include: {
          category: true,
        },
      },

      review: true,
    },
  });

  return bookings;
};

const getSingleBookingFromDB = async (id: string, user: IJwtPayload) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id,
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
      service: {
        include: {
          category: true,
        },
      },
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (user.role === "CUSTOMER") {
    if (booking.customerId !== user.id) {
      throw new Error("You are not authorized to view this booking");
    }
  }

  if (user.role === "TECHNICIAN") {
    const technician = await prisma.technicianProfile.findUniqueOrThrow({
      where: {
        userId: user.id,
      },
    });

    if (booking.technicianId !== technician.id) {
      throw new Error("You are not authorized to view this booking");
    }
  }

  return booking;
};

const updateBookingStatusIntoDB = async (
  bookingId: string,
  payload: IUpdateBookingStatus,
  user: IJwtPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId: user.id,
    },
  });

  if (booking.technicianId !== technician.id) {
    throw new Error("You are not authorized to update this booking");
  }

  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  };

  const allowedStatus = validTransitions[booking.status] || [];

  if (!allowedStatus.includes(payload.status)) {
    throw new Error(
      `Cannot change booking status from ${booking.status} to ${payload.status}`,
    );
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: payload.status,
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
      service: true,
    },
  });

  return result;
};

const cancelBookingIntoDB = async (bookingId: string, user: IJwtPayload) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== user.id) {
    throw new Error("You are not authorized to cancel this booking");
  }

  if (
    booking.status === "IN_PROGRESS" ||
    booking.status === "COMPLETED" ||
    booking.status === "DECLINED" ||
    booking.status === "CANCELLED"
  ) {
    throw new Error(
      `Booking cannot be cancelled because it is ${booking.status}`,
    );
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CANCELLED",
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
      service: true,
    },
  });

  return result;
};

export const bookingService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  getSingleBookingFromDB,
  updateBookingStatusIntoDB,
  cancelBookingIntoDB,
};
