import type { Program } from "@/app/modules/programs/types/program.types";
import type { ProgramDisplayItem } from "@/app/modules/programs/types/programDisplay.types";
import type { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import type { RecordTone } from "@/lib/utils/record-details";
import { getChurchDateInputValue } from "@/lib/utils/church-date";

export function isProgramDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getProgramDateValue(value?: string | null) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return isProgramDate(value) ? value : "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? getChurchDateInputValue(date) : "";
}

// A program has a calendar date, but no reliable overall start/end or completion flag.
export function getProgramDayState(value: string, now = new Date()): { label: string; tone: RecordTone } {
  const date = getProgramDateValue(value);
  if (!date || !Number.isFinite(now.getTime())) return { label: "Date to confirm", tone: "neutral" };
  const today = getChurchDateInputValue(now);
  if (date === today) return { label: "Today", tone: "positive" };
  return date > today ? { label: "Upcoming", tone: "info" } : { label: "Past program", tone: "neutral" };
}

export function getOrderedProgramItems<T extends ProgramDisplayItem>(items?: readonly T[] | null): T[] {
  const order = (item: T) => Number.isFinite(item.sequence) && item.sequence > 0 ? item.sequence : Infinity;
  return [...(items ?? [])].sort((a, b) => order(a) - order(b));
}

export function getProgramTime(value?: string | null) {
  const time = value?.trim();
  if (!time) return { label: "Time to confirm", dateTime: null };
  const valid = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time);
  return { label: valid ? time.slice(0, 5) : time, dateTime: valid ? time : null };
}

export function getProgramPerson(item: ProgramDisplayItem) {
  const person = item.responsible;
  const name = [person?.prefix, person?.firstName, person?.lastName].filter(Boolean).join(" ").trim();
  const id = person?.id || item.responsibleId || null;
  return { id, name: name || (id ? "Assigned member" : "Not assigned"), assigned: !!(id || name) };
}

export function getProgramSummary(items?: readonly ProgramDisplayItem[] | null) {
  const activities = items ?? [];
  return {
    total: activities.length,
    timed: activities.filter((item) => !!item.time?.trim()).length,
    unassigned: activities.filter((item) => !getProgramPerson(item).assigned).length,
  };
}

// Preserve the original activity identities and church-local calendar day for editors.
export function getProgramEditorValues(program: Program) {
  return {
    ...program,
    date: getProgramDateValue(program.date),
    location: program.location ?? "",
    homecellId: program.homecell?.id || program.homecellId || undefined,
    items: getOrderedProgramItems(program.items).map((item) => ({
      ...item,
      description: item.description ?? "", time: item.time ?? "",
      responsible: item.responsible || (item.responsibleId ? { id: item.responsibleId, firstName: "", lastName: "" } : null),
    })),
  };
}

export function getTemplateEditorValues(template: ProgramTemplate) {
  return {
    id: template.id, name: template.name, typeId: template.type?.id || "",
    homecellId: template.homecell?.id || template.homecellId || "",
    items: getOrderedProgramItems(template.items).map((item) => ({
      id: item.id, title: item.title, description: item.description ?? "", time: item.time ?? "",
      responsibleId: item.responsible?.id || item.responsibleId || "",
    })),
  };
}

export function getTemplateCreationInput(templateId: string, date: string) {
  if (!templateId || !isProgramDate(date)) throw new Error("Choose a valid program date.");
  // The endpoint copies type, homecell, activities and assignments from the template.
  // Responsibility overrides are not part of its supported contract.
  return { templateId, date };
}
