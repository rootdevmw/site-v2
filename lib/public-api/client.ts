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

export async function publicApi<T>(
  path: string,
  options?: RequestInit & { revalidate?: number },
): Promise<PublicApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const { revalidate = 60, ...requestOptions } = options ?? {};
  const res = await fetch(`${baseUrl}${path}`, {
    ...requestOptions,
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}
