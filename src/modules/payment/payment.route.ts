import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.CUSTOMER),
  paymentController.createCheckoutSession,
);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);

router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentDetails);

export const paymentRoutes = router;
