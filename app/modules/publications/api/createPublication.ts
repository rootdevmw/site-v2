import { api } from "@/lib/api/client";
import { Publication, PublicationFormValues } from "../types/publication.types";

export async function createPublication(
  data: PublicationFormValues,
): Promise<{ data: Publication }> {
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

  const res = await api.post("/publications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
