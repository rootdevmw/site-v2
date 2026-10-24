import { z } from "zod";
export const prayerFormSchema = z.object({
  name: z.string().trim().max(191),
  phone: z.string().trim().max(191),
  email: z.union([z.literal(""), z.email()]),
  prayerFor: z.string().trim().min(1).max(191),
  requestType: z.string().trim().max(191),
  request: z
    .string()
    .trim()
    .min(1, "Please enter your prayer request.")
    .max(16000, "Use at most 16,000 characters."),
  isUrgent: z.boolean(),
  shareWithElders: z.enum(["Yes", "No"]),
});
export type PrayerSubmission = z.infer<typeof prayerFormSchema>;
export const initialPrayerForm: PrayerSubmission = {
  name: "",
  phone: "",
  email: "",
  prayerFor: "Myself",
  requestType: "",
  request: "",
  isUrgent: false,
  shareWithElders: "Yes",
};
