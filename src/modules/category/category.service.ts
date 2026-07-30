import { prisma } from "../../lib/prisma";

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const categoryService = {
  getAllCategoriesFromDB,
};
