import { cache } from "react";
import { getLiveStream } from "./streams";
import { loadHomeFeed } from "@/lib/utils/optional-feed";

export const getCurrentLiveStream = cache(async () => {
  const result = await loadHomeFeed((options) => getLiveStream(options));
  return result.data?.isLive ? result.data : null;
});
