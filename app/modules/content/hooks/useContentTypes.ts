import { useQuery } from "@tanstack/react-query";
import { getContentTypes } from "../api/getContentTypes";

export function useContentTypes() {
  return useQuery({
    queryKey: ["content-types"],
    queryFn: getContentTypes,
  });
}
