import { cache } from "react";
import { readLiveSnapshot } from "./live";

export const getCurrentLiveStream = cache(async () => {
  const result = await readLiveSnapshot();
  return result.state === "live" ? result.broadcast : null;
});
