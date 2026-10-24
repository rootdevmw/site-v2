export type RecordTone = "neutral" | "positive" | "warning" | "danger" | "info";
export type RelatedRecord = { id: string; name: string };
export type MinistryRelationship = RelatedRecord | { ministry: RelatedRecord | null };

// Private detail endpoints return Prisma join records; some callers already
// provide flat records. Keep one consistent shape for related navigation.
export function getRelatedMinistries(items?: (MinistryRelationship | null)[] | null): RelatedRecord[] {
  const records = new Map<string, RelatedRecord>();
  for (const item of items ?? []) {
    const record = item && ("ministry" in item ? item.ministry : item);
    if (record?.id && record.name) records.set(record.id, record);
  }
  return [...records.values()];
}

export function readableRecordLabel(value?: string | null, fallback = "Not recorded") {
  if (!value?.trim()) return fallback;
  return value.trim().toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getEventPhase(startTime: string, endTime: string, now = Date.now()): { label: string; tone: RecordTone } {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return { label: "Date to confirm", tone: "neutral" };
  if (now < start) return { label: "Upcoming", tone: "info" };
  if (now >= end) return { label: "Past event", tone: "neutral" };
  return { label: "In progress", tone: "positive" };
}

export function getPrayerState(status: string): { label: string; tone: RecordTone; canMarkPrayed: boolean } {
  switch (status) {
    case "PENDING": return { label: "Awaiting prayer", tone: "warning", canMarkPrayed: true };
    case "REVIEWED": return { label: "Reviewed", tone: "info", canMarkPrayed: true };
    case "PRAYED_FOR": return { label: "Prayed for", tone: "positive", canMarkPrayed: false };
    default: return { label: readableRecordLabel(status), tone: "neutral", canMarkPrayed: false };
  }
}

export function getVisitorState(status: string): { label: string; tone: RecordTone; canAcknowledge: boolean } {
  switch (status) {
    case "PENDING": return { label: "Awaiting welcome", tone: "warning", canAcknowledge: true };
    case "CONFIRMED": return { label: "Acknowledged", tone: "positive", canAcknowledge: false };
    case "COMPLETED": return { label: "Completed", tone: "neutral", canAcknowledge: false };
    default: return { label: readableRecordLabel(status), tone: "neutral", canAcknowledge: false };
  }
}

export function getRecordFailure(error: unknown) {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 404) return "missing";
  if (status === 403) return "forbidden";
  if (status === 401) return "session";
  return "error";
}

export function retryRecordRequest(failureCount: number, error: unknown) {
  return getRecordFailure(error) === "error" && failureCount < 1;
}

export function getPhoneHref(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? "tel:" + (phone?.trim().startsWith("+") ? "+" : "") + digits : undefined;
}
