import {
  BookingWhereInput,
  UserWhereInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  IBookingQuery,
  ICategory,
  IUpdateUserStatus,
  IUserQuery,
} from "./admin.interface";

const getAllUsersFromDB = async (query: IUserQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: UserWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.role) {
    andConditions.push({
      role: query.role,
    });
  }

  if (query.activeStatus) {
    andConditions.push({
      activeStatus: query.activeStatus,
    });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: andConditions,
    },

    skip,
    take: limit,

    orderBy: {
      [sortBy]: sortOrder,
    },

    omit: {
      password: true,
    },

    include: {
      technician: true,
    },
  });

  const total = await prisma.user.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatusIntoDB = async (
  id: string,
  payload: IUpdateUserStatus,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      activeStatus: payload.activeStatus,
    },
    omit: {
      password: true,
    },
  });

  return result;
};

const getAllBookingsFromDB = async (query: IBookingQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const andConditions: BookingWhereInput[] = [];

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  if (query.customerId) {
    andConditions.push({
      customerId: query.customerId,
    });
  }

  if (query.technicianId) {
    andConditions.push({
      technicianId: query.technicianId,
    });
  }

  if (query.serviceId) {
    andConditions.push({
      serviceId: query.serviceId,
    });
  }

  const bookings = await prisma.booking.findMany({
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

      service: {
        include: {
          category: true,
        },
      },

      review: true,
    },
  });

  const total = await prisma.booking.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createCategoryIntoDB = async (payload: ICategory, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  if (user.role !== "ADMIN") {
    throw new Error("Only admin can create categories");
  }

  const isCategoryExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isCategoryExist) {
    throw new Error("Category already exists");
  }

  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return result;
};

const getSingleCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      services: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const updateCategoryIntoDB = async (id: string, payload: ICategory) => {
  const isExist = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new Error("Category not found");
  }

  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new Error("Category not found");
  }

  return await prisma.category.delete({
    where: {
      id,
    },
  });
};

export const adminService = {
  getAllUsersFromDB,
  updateUserStatusIntoDB,
  getAllBookingsFromDB,
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
