import { loadPublicEvent } from "@/lib/public-api/event-details";
import { eventCalendar } from "@/lib/utils/event-calendar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await loadPublicEvent((await params).id);
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (result.state !== "ready")
    return new Response(
      result.state === "missing"
        ? "Event not found."
        : "The event could not load. Please try again from the event page.",
      { status: result.state === "missing" ? 404 : 503, headers },
    );
  return new Response(eventCalendar(result.event, result.checkedAt), {
    headers: {
      ...headers,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="red-cross-event.ics"',
    },
  });
}
