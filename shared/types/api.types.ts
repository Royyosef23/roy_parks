/**
 * תגובת API סטנדרטית
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * תגובת API עם pagination
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * פרמטרי pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * פרמטרי חיפוש
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * שגיאת API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
