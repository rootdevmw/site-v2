import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserFormValues = z.infer<typeof userSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export type User = {
  id: string;
  email: string;
  roles: string[];
  member?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
};
