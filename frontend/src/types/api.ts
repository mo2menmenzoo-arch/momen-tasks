export interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
  timestamp: string;
}
