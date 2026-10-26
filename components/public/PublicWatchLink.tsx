import { loadLiveBroadcast } from "@/lib/public-api/library";
import { LiveStatusLink } from "./LiveStatusLink";

export async function PublicWatchLink() {
  const result = await loadLiveBroadcast();
  return (
    <LiveStatusLink
      initialSnapshot={{
        state:
          result.state !== "ready"
            ? "unavailable"
            : result.data
              ? "live"
              : "offline",
        broadcast: result.state === "ready" ? result.data : null,
        checkedAt: result.state === "ready" ? result.checkedAt : 0,
      }}
    />
  );
}
