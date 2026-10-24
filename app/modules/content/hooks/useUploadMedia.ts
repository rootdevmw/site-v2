import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "../api/uploadMedia";

interface UploadMediaVariables {
  file: File;
  onProgress?: (percent: number) => void;
}

export function useUploadMedia() {
  return useMutation({
    retry: false,
    mutationFn: ({ file, onProgress }: UploadMediaVariables) =>
      uploadMedia(file, onProgress),
  });
}
