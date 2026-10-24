import {
  EventDetails,
  eventMetadata,
} from "@/components/public/events/EventDetails";
import type { EventSearchParams } from "@/lib/utils/public-events";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<EventSearchParams>;
};
export async function generateMetadata({ params }: Props) {
  return eventMetadata((await params).id);
}
export default async function PublicEventDetailsPage({
  params,
  searchParams,
}: Props) {
  return (
    <EventDetails
      address={(await params).id}
      from={(await searchParams).from}
    />
  );
}
