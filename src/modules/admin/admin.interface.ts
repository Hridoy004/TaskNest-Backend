import { ActiveStatus, Role } from "../../../generated/prisma/enums";

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
