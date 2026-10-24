import { api } from "@/lib/api/client";
import { dashboardSchemas, type DashboardData, type DashboardSection } from "@/lib/utils/dashboard-overview";

export async function getDashboardSection<K extends DashboardSection>(section: K, signal?: AbortSignal): Promise<DashboardData[K]> {
  const response = await api.get<{ success?: boolean; data: unknown }>("/dashboard/overview/" + section, { signal, timeout: 15000, silent: true });
  if (response.data.success === false) throw new Error("The dashboard summary could not be read.");
  return dashboardSchemas[section].parse(response.data.data) as DashboardData[K];
}
