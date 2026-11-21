export interface ITechnicianQuery {
  searchTerm?: string;
  location?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: string;

  page?: string;
  limit?: string;

  sortBy?: string;
  sortOrder?: string;
}

export interface IUpdateTechnicianProfile {
  bio?: string;
  experience?: number;
  location?: string;
  hourlyRate?: number;
}

export interface IUpdateAvailability {
  isAvailable: boolean;
}
