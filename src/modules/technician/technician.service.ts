import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ITechnicianQuery,
  IUpdateTechnicianProfile,
} from "./technician.interface";

const getAllTechniciansFromDB = async (query: ITechnicianQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

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
    andConditions.push({
      isAvailable: query.isAvailable === "true",
    });
  }

  // Price Filter
  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      hourlyRate: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  const technicians = await prisma.technicianProfile.findMany({
    where: {
      AND: andConditions,
    },

    take: limit,
    skip: skip,

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
    },
  });

  const total = await prisma.technicianProfile.count({
    where: {
      AND: andConditions,
    },
  });

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

export const technicianService = {
  getAllTechniciansFromDB,
  getSingleTechnicianFromDB,
  updateTechnicianProfileIntoDB,
};
