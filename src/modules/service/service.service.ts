import { ServiceWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateService, IServiceQuery } from "./service.interface";

const createServiceIntoDB = async (payload: ICreateService, userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found");
  }

  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const result = await prisma.service.create({
    data: {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      categoryId: payload.categoryId,
      technicianId: technician.id,
    },
    include: {
      category: true,
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

  return result;
};

const getAllServicesFromDB = async (query: IServiceQuery) => {
  const parseNumber = (
    value: string | undefined,
    name: string,
    fallback?: number,
  ) => {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw Object.assign(new Error(`${name} must be a valid number`), {
        statusCode: 400,
      });
    }
    return parsed;
  };

  const page = parseNumber(query.page, "page", 1)!;
  const requestedLimit = parseNumber(query.limit, "limit", 10)!;
  const limit = Math.min(requestedLimit, 100);

  if (!Number.isInteger(page) || page < 1) {
    throw Object.assign(new Error("page must be a positive integer"), {
      statusCode: 400,
    });
  }
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
    throw Object.assign(new Error("limit must be a positive integer"), {
      statusCode: 400,
    });
  }

  const skip = (page - 1) * limit;

  const allowedSortFields = ["createdAt", "updatedAt", "price", "title"];
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";
  if (!allowedSortFields.includes(sortBy)) {
    throw Object.assign(new Error("sortBy is not supported"), {
      statusCode: 400,
    });
  }
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    throw Object.assign(new Error("sortOrder must be asc or desc"), {
      statusCode: 400,
    });
  }

  const andConditions: ServiceWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        {
          category: {
            name: { contains: query.searchTerm, mode: "insensitive" },
          },
        },
        {
          technician: {
            user: {
              name: { contains: query.searchTerm, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.technicianId) {
    andConditions.push({
      technicianId: query.technicianId,
    });
  }

  if (query.location) {
    andConditions.push({
      technician: {
        location: {
          contains: query.location,
          mode: "insensitive",
        },
      },
    });
  }

  const minRating = parseNumber(query.minRating, "minRating");
  if (minRating !== undefined && (minRating < 0 || minRating > 5)) {
    throw Object.assign(new Error("minRating must be between 0 and 5"), {
      statusCode: 400,
    });
  }
  if (minRating !== undefined) {
    andConditions.push({
      technician: {
        averageRating: {
          gte: minRating,
        },
      },
    });
  }

  const minPrice = parseNumber(query.minPrice, "minPrice");
  const maxPrice = parseNumber(query.maxPrice, "maxPrice");
  if (
    (minPrice !== undefined && minPrice < 0) ||
    (maxPrice !== undefined && maxPrice < 0) ||
    (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
  ) {
    throw Object.assign(new Error("Price range is invalid"), {
      statusCode: 400,
    });
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    });
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where: {
        AND: andConditions,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        category: true,
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
    }),
    prisma.service.count({
      where: {
        AND: andConditions,
      },
    }),
  ]);

  return {
    data: services,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSingleServiceFromDB = async (id: string) => {
  const service = await prisma.service.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      category: true,

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

  return service;
};

const updateServiceIntoDB = async (
  id: string,
  payload: ICreateService,
  userId: string,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const service = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.technicianId !== technician.id) {
    throw new Error("You are not authorized to update this service");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  const result = await prisma.service.update({
    where: {
      id,
    },
    data: payload,
    include: {
      category: true,
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

  return result;
};

const deleteServiceFromDB = async (id: string, userId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const service = await prisma.service.findUnique({
    where: {
      id,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.technicianId !== technician.id) {
    throw new Error("You are not authorized to delete this service");
  }

  await prisma.service.delete({
    where: {
      id,
    },
  });

  return null;
};

export const serviceService = {
  createServiceIntoDB,
  getAllServicesFromDB,
  getSingleServiceFromDB,
  updateServiceIntoDB,
  deleteServiceFromDB,
};
