import type { PublicationFormValues } from "../validation/publication.schema";

export type Publication = {
  id: string;
  title: string;
  fileUrl: string;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type { PublicationFormValues };
