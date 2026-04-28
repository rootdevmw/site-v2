import { api } from "@/lib/api/client";

export async function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/content/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  return res.data.data;
}
