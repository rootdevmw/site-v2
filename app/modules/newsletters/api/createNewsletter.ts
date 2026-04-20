import { api } from "@/lib/api/client";
import { Newsletter, NewsletterFormValues } from "../types/newsletter.types";

export async function createNewsletter(
  data: NewsletterFormValues,
): Promise<{ data: Newsletter }> {
  const formData = new FormData();

  formData.append("title", data.title);
  if (data.description) {
    formData.append("description", data.description);
  }
  if (data.publishedAt) {
    formData.append("publishedAt", data.publishedAt.toISOString());
  }
  if (data.file) {
    formData.append("file", data.file);
  }

  const res = await api.post("/newsletters", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
