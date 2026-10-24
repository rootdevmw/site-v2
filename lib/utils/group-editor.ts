import { z } from "zod";
import type { GroupKind } from "./group-members";
const profile = z.string().refine((value) => !value || /^[1-9]\d*$/.test(value) && value.length <= 19 && BigInt(value) <= BigInt("9223372036854775807"), "Choose a directory profile.").optional();
const fields = z.object({ name: z.string().trim().min(1, "Name is required.").max(191), purpose: z.string().trim().max(191).optional(), location: z.string().trim().max(191).optional(), description: z.string().refine((value) => new TextEncoder().encode(value).byteLength <= 65535, "The description is too long. Shorten it before saving.").optional(), leaderId: profile, overseerId: profile });
export type GroupEditorValues = z.infer<typeof fields>;
export type LeadershipPerson = { id: string; name: string; prefix?: string | null; location?: string | null };
export function groupEditorSchema(kind: GroupKind) {
  return fields.superRefine((values, context) => {
    if (kind === "ministry" && !values.purpose?.trim()) context.addIssue({ code: "custom", path: ["purpose"], message: "Purpose is required." });
    if (kind === "homecell" && values.leaderId && values.overseerId && values.leaderId === values.overseerId) context.addIssue({ code: "custom", path: ["overseerId"], message: "Choose a different person from the leader." });
  });
}
export function groupEditorDefaults(initial?: Partial<GroupEditorValues>) { return { name: "", purpose: "", location: "", description: "", leaderId: "", overseerId: "", ...initial }; }
export function groupEditorPayload(kind: GroupKind, values: GroupEditorValues, changed: { leader?: boolean; overseer?: boolean }) {
  return { name: values.name, ...(kind === "ministry" ? { purpose: values.purpose, description: values.description } : { location: values.location }), ...(changed.leader && { leaderId: values.leaderId || "" }), ...(changed.overseer && { overseerId: values.overseerId || "" }) };
}
export const groupEditorInfo = {
  ministry: { singular: "ministry", plural: "ministries", title: "Ministry", description: "Bring people together around a shared purpose and a meaningful place to serve." },
  homecell: { singular: "homecell", plural: "homecells", title: "Homecell", description: "Create a smaller community for fellowship, prayer and growing together." },
} as const;
export function groupEditorFailure(error: unknown, creating: boolean) {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 401) return "Your session may have expired. Sign in again before saving.";
  if (status === 403) return "Your account no longer has permission to save this group.";
  if (status === 404) return "This group is no longer available. Review the directory before trying again.";
  if (status === 400) return "Review the name, required fields and selected leadership profiles. A selected person may no longer be available. Your entries are kept.";
  if (status === 409) return "The public web address is already in use. Try another group name. Your entries are kept.";
  return creating ? "The save could not be confirmed. Check the directory before retrying; the group may already have been created. Your entries are kept." : "The save could not be confirmed. Review the saved group before retrying. Your entries are kept.";
}
