export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  message: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  firstName: string;
  lastName: string;
}
