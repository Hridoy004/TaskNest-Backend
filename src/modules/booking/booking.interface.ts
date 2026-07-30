import { BookingStatus } from "../../../generated/prisma/enums";

export interface ICreateBooking {
  serviceId: string;
  bookingDate: Date;
}

export interface IJwtPayload {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
}
