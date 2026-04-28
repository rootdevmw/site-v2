"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";

import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useMinistries } from "@/app/modules/ministries/hooks/useMinistries";
import { useHomecells } from "@/app/modules/homecells/hooks/useHomecells";
import { useContents } from "@/app/modules/content/hooks/useContents";
import { useContentTypes } from "@/app/modules/content/hooks/useContentTypes";
import { useEvents } from "@/app/modules/events/hooks/useEvents";
import { useEventTypes } from "@/app/modules/events/hooks/useEventTypes";
import { useAnnouncements } from "@/app/modules/announcements/hooks/useAnnouncements";
import { usePrograms } from "@/app/modules/programs/hooks/usePrograms";
import { useProgramTypes } from "@/app/modules/programs/hooks/useProgramTypes";
import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useStreams } from "@/app/modules/streams/hooks/useStreams";
import { usePlatforms } from "@/app/modules/streams/hooks/usePlatforms";
import { usePublications } from "@/app/modules/publications/hooks/usePublications";
import { useUsers } from "@/app/modules/users/hooks/useUsers";
import { useRoles } from "@/app/modules/roles/hooks/useRoles";

type CountSource = {
  data?: unknown[];
  meta?: { total?: number };
};

type ModuleSummary = {
  label: string;
  description: string;
  href: string;
  createHref?: string;
  count: number | string;
  isLoading?: boolean;
  icon: JSX.Element;
};

function getCount(source?: CountSource) {
  if (!source) return "--";
  return source.meta?.total ?? source.data?.length ?? 0;
}

function SummaryCard({ summary }: { summary: ModuleSummary }) {
  const router = useRouter();

  return (
    <div className="group bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-4 transition-colors hover:border-[var(--main-gold)]/30">
      <button
        type="button"
        onClick={() => router.push(summary.href)}
        className="flex flex-col gap-3 text-left w-full"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--main-gold)]/10 text-[var(--main-gold)]">
            {summary.icon}
          </div>
          <span className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {summary.isLoading ? (
              <span className="inline-block h-7 w-10 rounded bg-[var(--card-elevated)] animate-pulse" />
            ) : (
              summary.count
            )}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {summary.label}
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            {summary.description}
          </p>
        </div>
      </button>

      {summary.createHref && (
        <button
          type="button"
          onClick={() => router.push(summary.createHref!)}
          className="self-start text-xs font-medium text-[var(--main-gold)] hover:underline underline-offset-2"
        >
          + Add new
        </button>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-end justify-between pb-3 border-b border-[var(--border-soft)]">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

const icons: Record<string, JSX.Element> = {
  members: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  ),
  ministries: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  homecells: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  events: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  content: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  contentTypes: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  announcements: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  ),
  programs: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  ),
  templates: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  ),
  streams: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
      />
    </svg>
  ),
  publications: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  users: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  roles: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  tag: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  platforms: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  ),
};

export default function DashboardPage() {
  const members = useMembers({ page: 1, limit: 1 });
  const ministries = useMinistries({ page: 1, limit: 1 });
  const homecells = useHomecells({ page: 1, limit: 1 });
  const contents = useContents({ page: 1, limit: 1 });
  const contentTypes = useContentTypes();
  const events = useEvents({ page: 1, limit: 1 });
  const eventTypes = useEventTypes();
  const announcements = useAnnouncements({ page: 1, limit: 1 });
  const programs = usePrograms({ page: 1, limit: 1 });
  const programTypes = useProgramTypes();
  const programTemplates = useProgramTemplates();
  const streams = useStreams({ page: 1, limit: 1 });
  const platforms = usePlatforms();
  const publications = usePublications({ page: 1, limit: 1 });
  const users = useUsers({ page: 1, limit: 1 });
  const roles = useRoles({ page: 1, limit: 1 });

  const primarySummaries: ModuleSummary[] = [
    {
      label: "Members",
      description: "People and church membership",
      href: "/dashboard/members",
      createHref: "/dashboard/members/new",
      count: getCount(members.data),
      isLoading: members.isLoading,
      icon: icons.members,
    },
    {
      label: "Ministries",
      description: "Serving teams and leaders",
      href: "/dashboard/ministries",
      createHref: "/dashboard/ministries/new",
      count: getCount(ministries.data),
      isLoading: ministries.isLoading,
      icon: icons.ministries,
    },
    {
      label: "Homecells",
      description: "Small groups and locations",
      href: "/dashboard/homecells",
      createHref: "/dashboard/homecells/new",
      count: getCount(homecells.data),
      isLoading: homecells.isLoading,
      icon: icons.homecells,
    },
    {
      label: "Events",
      description: "Church calendar and activities",
      href: "/dashboard/events",
      createHref: "/dashboard/events/new",
      count: getCount(events.data),
      isLoading: events.isLoading,
      icon: icons.events,
    },
  ];

  const moduleSummaries: ModuleSummary[] = [
    {
      label: "Content",
      description: "Sermons, articles, and teaching",
      href: "/dashboard/content",
      createHref: "/dashboard/content/new",
      count: getCount(contents.data),
      isLoading: contents.isLoading,
      icon: icons.content,
    },
    {
      label: "Content Types",
      description: "Content categories",
      href: "/dashboard/content-types",
      count: getCount(contentTypes.data),
      isLoading: contentTypes.isLoading,
      icon: icons.contentTypes,
    },
    {
      label: "Announcements",
      description: "Notices and communication",
      href: "/dashboard/announcements",
      createHref: "/dashboard/announcements/new",
      count: getCount(announcements.data),
      isLoading: announcements.isLoading,
      icon: icons.announcements,
    },
    {
      label: "Programs",
      description: "Service plans and schedules",
      href: "/dashboard/programs",
      createHref: "/dashboard/programs/new",
      count: getCount(programs.data),
      isLoading: programs.isLoading,
      icon: icons.programs,
    },
    {
      label: "Program Templates",
      description: "Reusable service structures",
      href: "/dashboard/program-templates",
      createHref: "/dashboard/program-templates/new",
      count: getCount(programTemplates.data),
      isLoading: programTemplates.isLoading,
      icon: icons.templates,
    },
    {
      label: "Streams",
      description: "Live streams and broadcasts",
      href: "/dashboard/streams",
      createHref: "/dashboard/streams/new",
      count: getCount(streams.data),
      isLoading: streams.isLoading,
      icon: icons.streams,
    },
    {
      label: "Publications",
      description: "Publication files and publishing",
      href: "/dashboard/publications",
      createHref: "/dashboard/publications/new",
      count: getCount(publications.data),
      isLoading: publications.isLoading,
      icon: icons.publications,
    },
    {
      label: "Users",
      description: "System accounts",
      href: "/dashboard/users",
      createHref: "/dashboard/users/new",
      count: getCount(users.data),
      isLoading: users.isLoading,
      icon: icons.users,
    },
  ];

  const setupSummaries: ModuleSummary[] = [
    {
      label: "Event Types",
      description: "Event categories",
      href: "/dashboard/events/new",
      count: getCount(eventTypes.data),
      isLoading: eventTypes.isLoading,
      icon: icons.tag,
    },
    {
      label: "Program Types",
      description: "Program categories",
      href: "/dashboard/program-types",
      createHref: "/dashboard/program-types/new",
      count: getCount(programTypes.data),
      isLoading: programTypes.isLoading,
      icon: icons.tag,
    },
    {
      label: "Platforms",
      description: "Streaming destinations",
      href: "/dashboard/streams/new",
      count: getCount(platforms.data),
      isLoading: platforms.isLoading,
      icon: icons.platforms,
    },
    {
      label: "Roles",
      description: "Access groups",
      href: "/dashboard/roles",
      createHref: "/dashboard/roles/new",
      count: getCount(roles.data),
      isLoading: roles.isLoading,
      icon: icons.roles,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="pb-5 border-b border-[var(--border-soft)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Overview
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Church operations at a glance
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {primarySummaries.map((summary) => (
          <SummaryCard key={summary.label} summary={summary} />
        ))}
      </div>

      {/* Modules */}
      <section className="space-y-5">
        <SectionHeader
          title="Modules"
          description="Manage the main dashboard areas"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {moduleSummaries.map((summary) => (
            <SummaryCard key={summary.label} summary={summary} />
          ))}
        </div>
      </section>

      {/* Setup */}
      <section className="space-y-5">
        <SectionHeader
          title="Setup"
          description="Configure supporting records"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {setupSummaries.map((summary) => (
            <SummaryCard key={summary.label} summary={summary} />
          ))}
        </div>
      </section>
    </div>
  );
}
