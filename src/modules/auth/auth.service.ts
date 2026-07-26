import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./auth.interface";

const registerUserIntoDB = async (payload: IRegisterUser) => {
  const { name, email, password, phone, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    },
  });

  if (role === "TECHNICIAN") {
    await prisma.technicianProfile.create({
      data: {
        userId: createdUser.id,
        bio: "",
        experience: 0,
        location: "",
        hourlyRate: 0,
        averageRating: 0,
        isAvailable: true,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: {
      password: true,
    },
    include: {
      technician: true,
    },
  });

  return user;
};

export const userService = {
  registerUserIntoDB,
};
