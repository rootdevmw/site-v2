import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { getCurrentLiveStream } from "@/lib/public-api/home";

export async function PublicWatchLink() {
  const stream = await getCurrentLiveStream();
  return (
    <Link href="/live" className="public-text-link">
      {stream?.isLive && <span aria-hidden="true" className="size-2 rounded-full bg-red-700" />}
      {stream?.isLive ? "Live now" : "Watch online"}
      <FiArrowUpRight aria-hidden="true" />
    </Link>
  );
}
