import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { getPublicPastors } from "@/lib/public-api/members";
import { loadHomeFeed } from "@/lib/utils/optional-feed";
import { getPublicLeaders } from "@/lib/utils/public-leadership";
import { LeadershipProfileCard } from "./LeadershipProfileCard";

export async function LeadershipProfiles() {
  const profiles = await loadHomeFeed(async (options) => {
    const response = await getPublicPastors(options);
    if (response.success === false)
      throw new Error("Leadership request failed");
    return { data: getPublicLeaders(response.data) };
  });

  if (!profiles.data?.length) {
    return (
      <div className="rounded-xl border border-[var(--public-line)] bg-white p-5">
        <p className="text-sm leading-7 text-[var(--public-muted)]">
          {profiles.unavailable
            ? "Pastor profiles are temporarily unavailable."
            : "Pastor profiles have not been published here yet."}{" "}
          You are welcome to contact the church team to learn more.
        </p>
        <Link href="/contact" className="public-text-link mt-2">
          Contact the church team <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <ul
      className={
        "grid gap-6 lg:gap-8 " +
        (profiles.data.length === 1
          ? "max-w-4xl"
          : profiles.data.length === 2
            ? "max-w-5xl sm:grid-cols-2"
            : "sm:grid-cols-2 xl:grid-cols-3")
      }
    >
      {profiles.data.map((person) => (
        <li key={person.id} className="min-w-0">
          <LeadershipProfileCard
            person={person}
            role="Pastor"
            featured={profiles.data.length === 1}
          />
        </li>
      ))}
    </ul>
  );
}
