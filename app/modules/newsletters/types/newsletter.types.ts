import type { NewsletterFormValues } from "../validation/newsletter.schema";

export type Newsletter = {
  id: string;
  title: string;
  fileUrl: string;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type { NewsletterFormValues };
