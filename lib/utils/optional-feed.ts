// Bound optional content requests so the welcome and visit information stay usable.
export async function loadHomeFeed<T>(load: (options: RequestInit) => Promise<{ data: T }>) {
  try {
    const response = await load({ signal: AbortSignal.timeout(3500) });
    return { data: response.data, unavailable: false };
  } catch {
    return { data: null, unavailable: true };
  }
}
