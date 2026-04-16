import { z } from "zod";

export const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  status: z.enum(["Visitor", "Member", "Baptized"]),
  location: z.string().optional(),
  homecellId: z.string().optional(),
  ministryIds: z.array(z.string()).optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: string;
  location?: string;
};
