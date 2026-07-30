import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);

router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus);

router.post("/categories", auth(Role.ADMIN), adminController.createCategory);

router.get("/categories", auth(Role.ADMIN), adminController.getAllCategories);

router.get(
  "/categories/:id",
  auth(Role.ADMIN),
  adminController.getSingleCategory,
);

router.patch(
  "/categories/:id",
  auth(Role.ADMIN),
  adminController.updateCategory,
);

router.delete(
  "/categories/:id",
  auth(Role.ADMIN),
  adminController.deleteCategory,
);

export const adminRoutes = router;
