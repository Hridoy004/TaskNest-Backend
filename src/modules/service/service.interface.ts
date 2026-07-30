export interface ICreateService {
  title: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface IServiceQuery {
  searchTerm?: string;
  categoryId?: string;
  location?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
