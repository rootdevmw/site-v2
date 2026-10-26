import { FiArrowUpRight } from "react-icons/fi";
import { church } from "@/config/church";

export function ChannelLinks() {
  return (
    <div className="mt-5 flex flex-wrap gap-5">
      {[
        ["Our YouTube channel", church.youtubeUrl],
        ["Our Facebook page", church.facebookUrl],
        ["Our TikTok page", church.tiktokUrl],
      ].map(([label, href]) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="public-text-link"
        >
          {label}
          <FiArrowUpRight aria-hidden="true" />
          <span className="sr-only"> in a new tab</span>
        </a>
      ))}
    </div>
  );
}
