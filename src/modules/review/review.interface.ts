export interface ICreateReview {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IReviewQuery {
  technicianId?: string;
  bookingId?: string;
  rating?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
