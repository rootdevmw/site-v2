import { z } from "zod";

export const homecellSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    location: z.string().min(2, "Location is required"),
    leaderId: z.string().optional(),
    overseerId: z.string().optional(),
  })
  .refine((data) => data.leaderId !== data.overseerId, {
    message: "Leader and Overseer cannot be the same person",
    path: ["overseerId"],
  });
