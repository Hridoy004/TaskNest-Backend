import {
  ActiveStatus,
  BookingStatus,
  Role,
} from "../../../generated/prisma/enums";

export interface ICategory {
  name: string;
}

export interface IUserQuery {
  searchTerm?: string;
  role?: Role;
  activeStatus?: ActiveStatus;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface IUpdateUserStatus {
  activeStatus: ActiveStatus;
}

export interface IBookingQuery {
  page?: string;
  limit?: string;
  status?: BookingStatus;
  customerId?: string;
  technicianId?: string;
  serviceId?: string;
  sortBy?: string;
  sortOrder?: string;
}
