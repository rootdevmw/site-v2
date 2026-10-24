import { loadLiveBroadcast } from "@/lib/public-api/library";
import { LiveStatusLink } from "./LiveStatusLink";

export async function PublicWatchLink() {
  const result = await loadLiveBroadcast();
  return (
    <LiveStatusLink
      initialStatus={
        result.state !== "ready"
          ? "unavailable"
          : result.data
            ? "live"
            : "offline"
      }
    />
  );
}
