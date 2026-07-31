import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { adminRoutes } from "./modules/admin/admin.route";
import { authRoutes } from "./modules/auth/auth.route";
import { bookingRoutes } from "./modules/booking/booking.route";
import { categoryRoutes } from "./modules/category/category.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRouters } from "./modules/review/review.route";
import { ServiceRoutes } from "./modules/service/service.route";
import { technicianRoutes } from "./modules/technician/technician.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use("/api/payments/confirm", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRouters);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
