import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ITechnicianQuery,
  IUpdateAvailability,
  IUpdateTechnicianProfile,
} from "./technician.interface";

const getAllTechniciansFromDB = async (query: ITechnicianQuery) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit = query.limit === undefined ? 10 : Number(query.limit);
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
  const limit = Math.min(requestedLimit, 100);
  const skip = (page - 1) * limit;

  const andConditions: TechnicianProfileWhereInput[] = [];

  // Search
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: query.searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          location: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          services: {
            some: {
              title: {
                contains: query.searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  // Location Filter
  if (query.location) {
    andConditions.push({
      location: {
        contains: query.location,
        mode: "insensitive",
      },
    });
  }

  // Availability Filter
  if (query.isAvailable !== undefined) {
    if (query.isAvailable !== "true" && query.isAvailable !== "false") {
      throw Object.assign(new Error("isAvailable must be true or false"), {
        statusCode: 400,
      });
    }
    andConditions.push({
      isAvailable: query.isAvailable === "true",
    });
  }

  const minRating = query.minRating === undefined
    ? undefined
    : Number(query.minRating);
  if (
    minRating !== undefined &&
    (!Number.isFinite(minRating) || minRating < 0 || minRating > 5)
  ) {
    throw Object.assign(new Error("minRating must be between 0 and 5"), {
      statusCode: 400,
    });
  }
  if (minRating !== undefined) {
    andConditions.push({
      averageRating: { gte: minRating },
    });
  }

  // Price Filter
  if (query.minPrice || query.maxPrice) {
    const minPrice =
      query.minPrice === undefined ? undefined : Number(query.minPrice);
    const maxPrice =
      query.maxPrice === undefined ? undefined : Number(query.maxPrice);
    if (
      (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
    ) {
      throw Object.assign(new Error("Price range is invalid"), {
        statusCode: 400,
      });
    }
    andConditions.push({
      hourlyRate: {
        gte: minPrice,
        lte: maxPrice,
      },
    });
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "hourlyRate",
    "averageRating",
    "experience",
  ];
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";
  if (
    !allowedSortFields.includes(sortBy) ||
    (sortOrder !== "asc" && sortOrder !== "desc")
  ) {
    throw Object.assign(new Error("Invalid technician sort options"), {
      statusCode: 400,
    });
  }

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where: {
        AND: andConditions,
      },
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        services: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    }),
    prisma.technicianProfile.count({
      where: {
        AND: andConditions,
      },
    }),
  ]);

  return {
    data: technicians,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSingleTechnicianFromDB = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        omit: {
          password: true,
        },
      },

      services: {
        include: {
          category: true,
        },
      },

      reviews: {
        include: {
          customer: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  if (!technician) {
    throw new Error("Technician not found");
  }

  return technician;
};

const updateTechnicianProfileIntoDB = async (
  userId: string,
  payload: IUpdateTechnicianProfile,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const result = await prisma.technicianProfile.update({
    where: {
      id: technician.id,
    },
    data: payload,
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
    },
  });

  return result;
};

const updateAvailabilityIntoDB = async (
  userId: string,
  payload: IUpdateAvailability,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const result = await prisma.technicianProfile.update({
    where: {
      id: technician.id,
    },
    data: {
      isAvailable: payload.isAvailable,
    },
  });

  return result;
};

export const technicianService = {
  getAllTechniciansFromDB,
  getSingleTechnicianFromDB,
  updateTechnicianProfileIntoDB,
  updateAvailabilityIntoDB,
};
