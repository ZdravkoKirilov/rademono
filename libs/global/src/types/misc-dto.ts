export type PaginatedResult<T> = {
  data: T;
  limit: number;
  skip: number;
  total: number;
};
