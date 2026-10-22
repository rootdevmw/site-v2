"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePassword } from "@/app/modules/auth/hooks/useChangePassword";
import {
  accountChangePasswordSchema,
  accountFieldErrors,
  accountFailure,
} from "@/lib/utils/account-flows";
import { AccountPasswordField, AccountErrorSummary } from "./AccountFields";
import { InlineLoader } from "@/components/ui/InlineLoader";
export function ChangePasswordForm() {
  const mutation = useChangePassword();
  const form = useForm({
    resolver: zodResolver(accountChangePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirm: "" },
  });
  const [failure, setFailure] = useState(""),
    [attempt, setAttempt] = useState(0);
  const submitting = useRef(false),
    completed = useRef(false),
    summary = useRef<HTMLDivElement>(null);
  const { errors, isSubmitting } = form.formState,
    busy = mutation.isPending || isSubmitting;
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  async function submit(values: {
    currentPassword: string;
    password: string;
    confirm: string;
  }) {
    if (submitting.current || completed.current) return;
    submitting.current = true;
    setFailure("");
    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });
      completed.current = true;
      form.reset();
    } catch (error) {
      setFailure(accountFailure(error, "change"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }
  return (
    <form
      className="account-form"
      aria-label="Change password"
      aria-busy={busy}
      noValidate
      onSubmit={form.handleSubmit(submit, () =>
        setAttempt((value) => value + 1),
      )}
    >
      <AccountErrorSummary
        ref={summary}
        entries={accountFieldErrors(errors)}
        failure={failure}
        prefix="change-"
      />
      <AccountPasswordField
        id="change-currentPassword"
        label="Current password"
        autoComplete="current-password"
        required
        disabled={busy}
        error={errors.currentPassword?.message}
        {...form.register("currentPassword")}
      />
      <AccountPasswordField
        id="change-password"
        label="New password"
        autoComplete="new-password"
        required
        disabled={busy}
        help="Use at least 6 characters and choose a password you do not reuse elsewhere."
        error={errors.password?.message}
        {...form.register("password")}
      />
      <AccountPasswordField
        id="change-confirm"
        label="Confirm new password"
        autoComplete="new-password"
        required
        disabled={busy}
        error={errors.confirm?.message}
        {...form.register("confirm")}
      />
      <p className="account-help">
        After saving, all account sessions are signed out. You will return to
        sign in with your new password.
      </p>
      <div className="account-actions">
        <Link
          href="/dashboard"
          className="account-button account-button-secondary"
          onClick={(event) => {
            if (submitting.current) event.preventDefault();
          }}
        >
          Back to dashboard
        </Link>
        <button
          type="submit"
          className="account-button account-button-primary"
          disabled={busy}
        >
          {busy ? (
            <InlineLoader message="Updating your password..." />
          ) : (
            "Update password"
          )}
        </button>
      </div>
      <p className="account-help">
        Forgot your current password?{" "}
        <Link href="/login?mode=forgot" className="account-link">
          Request a reset link
        </Link>
      </p>
      {failure && (
        <Link href="/login" className="account-link">
          Try signing in to check the saved password
        </Link>
      )}
    </form>
  );
}
