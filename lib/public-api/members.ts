import { publicApi } from "./client";

export type PublicMember = {
  id: string | number;
  firstName: string;
  lastName: string;
  prefix?: string;
  status?: string;
  imageUrl?: string | null;
  bio?: {
    id: string | number;
    bio: string;
  } | null;
};

export async function getPublicMembersByPrefix(
  prefix: string,
  options?: RequestInit,
) {
  return publicApi<PublicMember[]>(`/members/${prefix.toUpperCase()}`, options);
}

export async function getPublicPastors(options?: RequestInit) {
  return publicApi<PublicMember[]>(`/members/pastors`, options);
}

export async function getPublicElders(options?: RequestInit) {
  return publicApi<PublicMember[]>(`/members/elders`, options);
}
