export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  method: string;
  statusCode: number;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  method: string;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
