import { z } from "zod";

// -----------------------------
// AUTH SCHEMAS
// -----------------------------
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// -----------------------------
// AUTH TYPES
// -----------------------------
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  data: User;
  meta: Record<string, any>;
}

export interface LoginResponse {
  success: boolean;
  data: {
    sessionId: string;
    user: User;
  };
  meta: Record<string, any>;
}
