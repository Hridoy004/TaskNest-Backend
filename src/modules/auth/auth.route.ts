import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  authController.getMyProfile,
);

router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;
