import { prisma } from "../../lib/prisma";
import { ICategory } from "./admin.interface";

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
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};
