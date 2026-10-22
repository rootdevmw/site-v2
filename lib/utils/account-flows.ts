import { z } from "zod";
export const accountEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .max(191, "Use an email address of at most 191 characters.");
export const accountNewPasswordSchema = z
  .string()
  .min(6, "Use at least 6 characters.")
  .refine(
    (value) => new TextEncoder().encode(value).byteLength <= 72,
    "This password is too long. Use at most 72 bytes; accented letters and emoji can use several bytes.",
  )
  .refine(
    (value) => !value.includes("\u0000"),
    "This password contains an unsupported character.",
  );
export const accountLoginSchema = z.object({
  email: accountEmailSchema,
  password: z.string().min(1, "Password is required."),
});
export const accountRecoverySchema = z.object({ email: accountEmailSchema });
export const accountPasswordSchema = z
  .object({
    password: accountNewPasswordSchema,
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "The passwords do not match.",
  });
export const accountChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: accountNewPasswordSchema,
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "The passwords do not match.",
  });
export function accountLinkToken(params: Pick<URLSearchParams, "getAll">) {
  const tokens = params.getAll("token");
  return tokens.length === 1 && /^[a-f0-9]{64}$/i.test(tokens[0])
    ? tokens[0]
    : null;
}
export function accountFieldErrors(
  errors: unknown,
): { path: string; message: string }[] {
  if (!errors || typeof errors !== "object") return [];
  return Object.entries(errors).flatMap(([path, error]) =>
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
      ? [{ path, message: error.message }]
      : [],
  );
}
export type AccountOperation = "login" | "request" | "set" | "reset" | "change";
export function accountFailureStatus(error: unknown) {
  const response =
    error && typeof error === "object" && "response" in error
      ? error.response
      : null;
  return response && typeof response === "object" && "status" in response
    ? response.status
    : null;
}
export function accountFailure(error: unknown, operation: AccountOperation) {
  const status = accountFailureStatus(error);
  if (status === 429)
    return "Too many attempts. Wait a little before trying again.";
  if (
    (operation === "set" || operation === "reset") &&
    (status === 400 || status === 404 || status === 410)
  )
    return "This link could not be used. Check the full link from your latest email, or request a new one.";
  if (operation === "login" && status === 401)
    return "The email and password were not accepted. Check them or request a password reset.";
  if (operation === "change" && status === 409)
    return "Your current password was not accepted or changed while saving. Check it before trying again.";
  if (status === 401)
    return "Your session has expired. Sign in again to continue.";
  if (status === 403)
    return "Your account cannot complete this action. Contact the church team for help.";
  if (status === 400)
    return "Check the highlighted fields and try again. Your entries are kept.";
  if (operation === "request")
    return "The reset request could not be confirmed. Check your inbox before requesting another link.";
  if (operation === "login")
    return "Sign-in could not be confirmed. Your entries are kept. Check your connection and try again.";
  return "The password change could not be confirmed. Try signing in with the new password before retrying, or request a fresh link.";
}
