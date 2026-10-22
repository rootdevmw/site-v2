import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { getPublicElders, getPublicPastors } from "@/lib/public-api/members";
import { loadHomeFeed } from "@/lib/utils/optional-feed";
import { getPublicLeaders } from "@/lib/utils/public-leadership";
import { LeaderPortrait } from "./LeaderPortrait";

export async function LeadershipProfiles({
  role,
}: {
  role: "Pastor" | "Elder";
}) {
  const profiles = await loadHomeFeed(async (options) => {
    const response = await (role === "Pastor"
      ? getPublicPastors(options)
      : getPublicElders(options));
    if (response.success === false)
      throw new Error("Leadership request failed");
    return { data: getPublicLeaders(response.data) };
  });

  if (!profiles.data?.length) {
    return (
      <div className="rounded-xl border border-[var(--public-line)] bg-white p-5">
        <p className="text-sm leading-7 text-[var(--public-muted)]">
          {profiles.unavailable
            ? `${role} profiles are temporarily unavailable.`
            : `${role} profiles have not been published here yet.`}{" "}
          You are welcome to contact the church team to learn more.
        </p>
        <Link href="/contact" className="public-text-link mt-2">
          Contact the church team <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {profiles.data.map((person) => (
        <li
          key={person.id}
          className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-4 sm:p-5"
        >
          <LeaderPortrait
            imageUrl={person.imageUrl}
            initials={person.initials}
          />
          <div className="px-1 pb-1 pt-5">
            <p className="public-eyebrow">{role}</p>
            <h4 className="public-display mt-2 text-2xl leading-snug wrap-anywhere">
              {person.name}
            </h4>
            {person.bio && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                {person.bio}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
