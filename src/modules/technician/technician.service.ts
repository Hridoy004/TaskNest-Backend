import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ITechnicianQuery } from "./technician.interface";

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

export const technicianService = {
  getAllTechniciansFromDB,
};
