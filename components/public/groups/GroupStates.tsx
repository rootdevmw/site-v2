import Link from "next/link";
import { groupPaths, type PublicGroupKind } from "@/lib/utils/public-groups";
export function GroupLoading({
  kind,
  detail = false,
}: {
  kind: PublicGroupKind;
  detail?: boolean;
}) {
  return (
    <section className="public-container public-section" role="status">
      <p className="public-eyebrow">Find your community</p>
      <h1 className="public-display mt-4 text-4xl leading-tight">
        Loading{" "}
        {detail
          ? `the ${kind}`
          : kind === "ministry"
            ? "ministries"
            : "homecells"}
        …
      </h1>
      <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
        Preparing the group information.
      </p>
    </section>
  );
}
export function GroupNotFound({ kind }: { kind: PublicGroupKind }) {
  return (
    <section className="public-container public-section">
      <p className="public-eyebrow">
        {kind === "ministry" ? "Ministry" : "Homecell"} not found
      </p>
      <h1 className="public-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Let&apos;s find another group.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        This group is not available at this address. Browse the directory or ask
        the church team for help getting connected.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={groupPaths[kind]}
          className="public-button public-button-primary"
        >
          Explore {kind === "ministry" ? "ministries" : "homecells"}
        </Link>
        <Link href="/contact" className="public-button public-button-secondary">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
