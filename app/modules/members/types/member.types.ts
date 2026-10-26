import { z } from "zod";
import { memberPrefixes } from "@/lib/utils/member-titles";

export const memberSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(191),
  lastName: z.string().trim().min(1, "Last name is required").max(191),
  phone: z.string().trim().max(191).optional(),
  status: z.enum(["VISITOR", "MEMBER"]),
  prefix: z.enum(memberPrefixes),
  isBaptized: z.boolean().optional(),
  location: z.string().trim().max(191).optional(),
  homecellId: z.string().optional(),
  ministryIds: z.array(z.string()).optional(),
  baptismDate: z.string().optional(),
  bio: z.string().refine((value) => new TextEncoder().encode(value).byteLength <= 65535, "The biography is too long. Shorten it before saving.").optional(),
  imageUrl: z.string().max(191).optional(),
}).superRefine((values, context) => {
  if (values.baptismDate) {
    const date = new Date(values.baptismDate + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.baptismDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== values.baptismDate) context.addIssue({ code: "custom", path: ["baptismDate"], message: "Choose a valid calendar date." });
  }
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: string;
  prefix?: string;
  location?: string;
  isBaptized?: boolean;
  baptismDate?: string;
  bio?: string;
  imageUrl?: string | null;
};
