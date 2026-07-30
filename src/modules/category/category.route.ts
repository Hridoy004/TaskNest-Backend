import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  categoryController.getAllCategories,
);

export const categoryRoutes = router;
