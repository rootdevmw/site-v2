import { api } from "@/lib/api/client";
import { collectMemberDirectory, type DirectoryPage } from "@/lib/utils/group-members";
import type { Program } from "@/app/modules/programs/types/program.types";

export async function getMemberDirectoryPage(params: { page: number; limit: number; search?: string }, signal?: AbortSignal) {
  const response = await api.get<DirectoryPage>("/members", { params, signal, timeout: 15000, silent: true });
  return response.data;
}

export async function getMemberDirectory(signal?: AbortSignal) {
  return collectMemberDirectory((page) => getMemberDirectoryPage({ page, limit: 100 }, signal), signal);
}

export async function getHomecellPrograms(id: string, page: number, signal?: AbortSignal) {
  const response = await api.get<{ data: Program[]; meta?: { total?: number; limit?: number } }>("/programs", {
    params: { homecellId: id, page, limit: 5 }, signal, timeout: 15000, silent: true,
  });
  return response.data;
}
