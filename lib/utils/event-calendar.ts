import { parsePublicEvent, type PublicEvent } from "./public-events";
import { messageExcerpt, prepareMessageBody } from "./public-message-body";

// RFC 5545 sections 3.1 and 3.3.11: CRLF content lines, UTF-8 byte folding,
// and escaped TEXT values. No attendees, invitations or alarms are created.
function calendarText(value: string) {
  return Array.from(value)
    .filter(
      (character) =>
        character === "\n" ||
        character === "\r" ||
        (character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127),
    )
    .join("")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}
function fold(value: string) {
  const lines: string[] = [];
  let line = "",
    size = 0;
  for (const character of value) {
    const bytes = new TextEncoder().encode(character).length;
    if (size + bytes > 75) {
      lines.push(line);
      line = " ";
      size = 1;
    }
    line += character;
    size += bytes;
  }
  return [...lines, line].join("\r\n");
}
function instant(value: string | number) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
export function eventCalendar(value: PublicEvent, generatedAt: number) {
  const event = parsePublicEvent(value);
  const description = messageExcerpt(
    prepareMessageBody(event.description || "").text,
    4000,
  );
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Church of Christ at Red Cross//Events//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:redcross-event-${calendarText(event.id)}`,
      `DTSTAMP:${instant(generatedAt)}`,
      `DTSTART:${instant(event.startTime)}`,
      `DTEND:${instant(event.endTime)}`,
      `SUMMARY:${calendarText(event.title)}`,
      ...(event.location?.trim()
        ? [`LOCATION:${calendarText(event.location.trim())}`]
        : []),
      ...(description ? [`DESCRIPTION:${calendarText(description)}`] : []),
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n") + "\r\n"
  );
}
