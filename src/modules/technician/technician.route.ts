import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { technicianController } from "./technician.controller";

const router = Router();

router.get("/", technicianController.getAllTechnicians);

router.get("/:id", technicianController.getSingleTechnician);

router.put(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile,
);

export const technicianRoutes = router;
