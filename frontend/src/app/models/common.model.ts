export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: ApiError[] | null;
  meta?: ApiMeta;
}

export interface ApiError {
  field: string;
  message: string;
}

export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
}
