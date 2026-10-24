export const journeyNames = [
  "visit_open",
  "directions_open",
  "broadcast_play",
  "broadcast_provider_open",
  "publication_open",
  "message_open",
  "group_enquiry",
  "prayer_submitted",
  "visit_submitted",
] as const;
export type JourneyName = (typeof journeyNames)[number];
export function publicPageFamily(path: string) {
  const clean = path.split(/[?#]/)[0];
  if (
    [
      "/",
      "/about",
      "/plan-visit",
      "/contact",
      "/ministries",
      "/homecells",
      "/content",
      "/events",
      "/programs",
      "/publications",
      "/live",
      "/prayer-request",
    ].includes(clean)
  )
    return clean;
  const match =
    /^\/(content|ministries|homecells|events|programs|publications|streams)\/[^/]+$/.exec(
      clean,
    );
  return match ? `/${match[1]}/[record]` : null;
}
export function safeJourney(value: unknown) {
  if (
    !value ||
    typeof value !== "object" ||
    !("event" in value) ||
    !("path" in value) ||
    typeof value.event !== "string" ||
    typeof value.path !== "string" ||
    !(journeyNames as readonly string[]).includes(value.event)
  )
    return null;
  const path = publicPageFamily(value.path);
  return path ? { event: value.event as JourneyName, path } : null;
}
