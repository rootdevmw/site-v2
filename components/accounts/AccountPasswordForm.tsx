"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetPassword } from "@/app/modules/auth/hooks/useSetPassword";
import { useResetPassword } from "@/app/modules/auth/hooks/useResetPassword";
import {
  accountPasswordSchema,
  accountFieldErrors,
  accountFailure,
} from "@/lib/utils/account-flows";
import { AccountPasswordField, AccountErrorSummary } from "./AccountFields";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function AccountPasswordForm({
  token,
  kind,
}: {
  token: string | null;
  kind: "set" | "reset";
}) {
  const setup = useSetPassword(),
    reset = useResetPassword(),
    mutation = kind === "set" ? setup : reset;
  const form = useForm({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const [failure, setFailure] = useState(""),
    [attempt, setAttempt] = useState(0),
    [success, setSuccess] = useState(false),
    [unusable, setUnusable] = useState(false);
  const submitting = useRef(false),
    completed = useRef(false),
    summary = useRef<HTMLDivElement>(null),
    confirmation = useRef<HTMLDivElement>(null);
  const { errors, isSubmitting } = form.formState,
    busy = mutation.isPending || isSubmitting;
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  useEffect(() => {
    if (success) confirmation.current?.focus();
  }, [success]);
  async function submit(values: { password: string; confirm: string }) {
    if (submitting.current || completed.current || !token || unusable) return;
    submitting.current = true;
    setFailure("");
    try {
      await mutation.mutateAsync({ token, password: values.password });
      completed.current = true;
      form.reset();
      setSuccess(true);
    } catch (error) {
      setFailure(accountFailure(error, kind));
      setAttempt((value) => value + 1);
      const status =
        error && typeof error === "object" && "response" in error
          ? (error.response as { status?: number })?.status
          : undefined;
      if (status === 404 || status === 410) {
        setUnusable(true);
        form.reset();
      }
    } finally {
      submitting.current = false;
    }
  }
  if (!token || unusable)
    return (
      <div className="account-feedback" role="alert">
        <h2>Use a fresh account link</h2>
        <p>
          {failure ||
            "This link is incomplete or invalid. Open the full link in your latest invitation or password-reset email."}
        </p>
        <div className="account-actions mt-4">
          <Link
            href="/login?mode=forgot"
            className="account-button account-button-primary"
          >
            Request a new link
          </Link>
          <Link
            href="/login"
            className="account-button account-button-secondary"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  if (success)
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        className="account-feedback account-feedback-success"
        role="status"
      >
        <h2>
          {kind === "set"
            ? "Your account is ready"
            : "Your password has been updated"}
        </h2>
        <p>Sign in with your email address and new password to continue.</p>
        <Link
          href="/login"
          className="account-button account-button-primary mt-4"
        >
          Continue to sign in
        </Link>
      </div>
    );
  return (
    <>
      <form
        className="account-form"
        aria-label={kind === "set" ? "Set account password" : "Reset password"}
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
          prefix="password-"
        />
        <AccountPasswordField
          id="password-password"
          label="New password"
          autoComplete="new-password"
          required
          disabled={busy}
          help="Use at least 6 characters and choose a password you do not reuse elsewhere."
          error={errors.password?.message}
          {...form.register("password")}
        />
        <AccountPasswordField
          id="password-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          required
          disabled={busy}
          error={errors.confirm?.message}
          {...form.register("confirm")}
        />
        <button
          type="submit"
          className="account-button account-button-primary"
          disabled={busy}
        >
          {busy ? (
            <InlineLoader message="Saving your password..." />
          ) : kind === "set" ? (
            "Set password"
          ) : (
            "Reset password"
          )}
        </button>
      </form>
      <p className="account-footnote">
        {failure && (
          <span className="block">
            <Link href="/login" className="account-link">
              Try signing in with your new password
            </Link>
          </span>
        )}
        Need a new email?{" "}
        <Link href="/login?mode=forgot" className="account-link">
          Request another link
        </Link>
      </p>
    </>
  );
}
