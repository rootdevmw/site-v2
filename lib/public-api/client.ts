export type PublicApiResponse<T> = {
  success?: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export class PublicApiError extends Error {
  constructor(public readonly status: number) {
    super("Public content could not be loaded.");
    this.name = "PublicApiError";
  }
}

export async function publicApi<T>(
  path: string,
  options?: RequestInit & { revalidate?: number },
): Promise<PublicApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const publicBaseUrl = baseUrl.concat("/public");
  const { revalidate, ...requestOptions } = options ?? {};
  void revalidate;
  const res = await fetch(`${publicBaseUrl}${path}`, {
    ...requestOptions,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new PublicApiError(res.status);
  }

  return res.json();
}
