import { useQuery, QueryKey } from "@tanstack/react-query";

type PaginatedParams = {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type Options<T> = {
  queryKey: QueryKey;
  queryFn: (params: PaginatedParams) => Promise<ApiResponse<T>>;
  params: PaginatedParams;
  enabled?: boolean;
  staleTime?: number;
};

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  params,
  enabled = true,
  staleTime = 1000 * 30,
}: Options<T>) {
  const { page = 1, limit = 10, ...rest } = params;

  return useQuery<ApiResponse<T>>({
    queryKey: [
      ...queryKey,
      page,
      limit,
      ...Object.values(rest ?? {}).map((v) => v ?? ""),
    ],

    queryFn: () =>
      queryFn({
        page,
        limit,
        ...rest,
      }),

    enabled,

    placeholderData: (prev) => prev,

    staleTime,
    retry: 1,
  });
}
