export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
