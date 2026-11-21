import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { serviceController } from "./service.controller";

const router = Router();

router.post("/", auth(Role.TECHNICIAN), serviceController.createService);

router.get("/", serviceController.getAllServices);

router.get("/:id", serviceController.getSingleService);

router.put(
  "/:id",
  auth(Role.ADMIN, Role.TECHNICIAN),
  serviceController.updateService,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.TECHNICIAN),
  serviceController.deleteService,
);

export const ServiceRoutes = router;
