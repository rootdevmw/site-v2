export function toInputDate(date?: string | Date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function fromInputDate(date?: string) {
  if (!date) return undefined;
  return new Date(date);
}
