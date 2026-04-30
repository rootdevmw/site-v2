import type { StreamFormValues } from "../validation/stream.schema";

export type Platform = {
  id: string;
  name: string;
  url: string;
};

export type Stream = {
  id: string;
  title: string;
  slug: string;
  isLive: boolean;
  startsAt: string | null;
  endsAt?: string | null;
  platforms: Platform[];
  createdAt: string;
};

export type { StreamFormValues };
