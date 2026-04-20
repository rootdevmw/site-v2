import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "../api/uploadMedia";

export function useUploadMedia() {
  return useMutation({
    mutationFn: uploadMedia,
  });
}
