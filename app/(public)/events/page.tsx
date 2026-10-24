import type { Metadata } from "next";
import { EventDirectory } from "@/components/public/events/EventDirectory";
import {
  readEventFilters,
  type EventSearchParams,
} from "@/lib/utils/public-events";
export const metadata: Metadata = {
  alternates: { canonical: "/events" },
  title: "Events",
  description:
    "Explore gatherings at Church of Christ at Red Cross in Blantyre. Find upcoming and past events, dates, venues and ways to take part.",
};
export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: Promise<EventSearchParams>;
}) {
  return <EventDirectory filters={readEventFilters(await searchParams)} />;
}
