import { z } from "zod";

// -----------------------------
// ROLE SCHEMAS
// -----------------------------
export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name too long"),
});

// -----------------------------
// ROLE TYPES
// -----------------------------
export type RoleFormValues = z.infer<typeof roleSchema>;

export interface Role {
  id: string;
  name: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  meta: Record<string, any>;
}
