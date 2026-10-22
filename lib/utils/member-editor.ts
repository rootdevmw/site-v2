import type { MemberFormValues } from "@/app/modules/members/types/member.types";
import { getChurchDateInputValue } from "./church-date";
export function memberEditorDefaults(data?: Partial<MemberFormValues>) {
  const date = data?.baptismDate ? new Date(data.baptismDate) : null;
  return { firstName: "", lastName: "", phone: "", location: "", homecellId: "", ministryIds: [], isBaptized: false, bio: "", imageUrl: "", ...data, baptismDate: data?.isBaptized && date && Number.isFinite(date.getTime()) ? getChurchDateInputValue(date) : "" };
}
export function memberEditorPayload(values: MemberFormValues, changed: { homecell?: boolean; ministries?: boolean }) {
  const { homecellId, ministryIds, ...fields } = values;
  return { ...fields, isBaptized: values.isBaptized ?? false, baptismDate: values.isBaptized ? values.baptismDate || "" : "", ...(changed.homecell && { homecellId: homecellId || "" }), ...(changed.ministries && { ministryIds: [...new Set(ministryIds ?? [])] }) };
}
export function memberPhotoError(file: Pick<File, "type" | "size">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPEG, PNG or WebP photograph.";
  return file.size > 5 * 1024 * 1024 ? "Choose a photograph smaller than 5 MB." : "";
}
export function memberSaveError(error: unknown, create: boolean) {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 401) return "Your session may have expired. Sign in again before saving.";
  if (status === 403) return "Your account no longer has permission to save member profiles.";
  if (status === 400 || status === 409) return "The profile could not be saved. Review the fields and current homecell/ministry choices, then try again. Your entries are kept.";
  if (status === 404) return "This member or a selected church connection is no longer available. Review the directory before trying again.";
  return create ? "The save could not be confirmed. Check the member directory before trying again; the profile may already have been created. Your entries are kept." : "The save could not be confirmed. Review the latest profile before trying again. Your entries are kept.";
}
