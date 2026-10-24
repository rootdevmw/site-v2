"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useLogin";
import { useRequestPasswordReset } from "../hooks/useRequestPasswordReset";
import { useAuthStore } from "../store/auth.store";
import { GuestGuard } from "./GuestGuard";
import { AccountShell } from "@/components/accounts/AccountShell";
import {
  AccountField,
  AccountPasswordField,
  AccountErrorSummary,
} from "@/components/accounts/AccountFields";
import {
  accountLoginSchema,
  accountRecoverySchema,
  accountFieldErrors,
  accountFailure,
} from "@/lib/utils/account-flows";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function LoginForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "forgot">(
      params.get("mode") === "forgot" ? "forgot" : "login",
    ),
    [email, setEmail] = useState("");
  const notice = useAuthStore((state) => state.notice);
  return (
    <AccountShell
      title={mode === "login" ? "Welcome back" : "Reset your password"}
      description={
        mode === "login"
          ? "Sign in to care for our congregation and support the work of the church."
          : "Enter the email address used for your church portal account."
      }
    >
      {mode === "login" ? (
        <GuestGuard>
          {notice === "password-uncertain" && (
            <div className="account-feedback mb-6" role="status">
              Your password update could not be confirmed. Try your new password
              first. If it is not accepted, request a fresh reset link.
            </div>
          )}
          {notice === "password-changed" && (
            <div
              className="account-feedback account-feedback-success mb-6"
              role="status"
            >
              Your password has been updated. Sign in again with your new
              password.
            </div>
          )}
          <SignInFields
            initialEmail={email}
            onForgot={(value) => {
              setEmail(value);
              setMode("forgot");
            }}
          />
        </GuestGuard>
      ) : (
        <RecoveryFields
          initialEmail={email}
          onBack={(value) => {
            setEmail(value);
            setMode("login");
          }}
        />
      )}
    </AccountShell>
  );
}
export function SignInFields({
  initialEmail = "",
  onForgot,
}: {
  initialEmail?: string;
  onForgot: (email: string) => void;
}) {
  const mutation = useLogin(),
    router = useRouter();
  const form = useForm({
    resolver: zodResolver(accountLoginSchema),
    defaultValues: { email: initialEmail, password: "" },
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
  async function submit(values: { email: string; password: string }) {
    if (submitting.current || completed.current) return;
    submitting.current = true;
    setFailure("");
    try {
      await mutation.mutateAsync(values);
      completed.current = true;
      form.reset({ email: values.email, password: "" });
      router.replace("/dashboard");
    } catch (error) {
      setFailure(accountFailure(error, "login"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }
  return (
    <>
      <form
        className="account-form"
        aria-label="Sign in"
        method="post"
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
          prefix="signin-"
        />
        <AccountField
          id="signin-email"
          label="Email address"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={191}
          required
          disabled={busy}
          error={errors.email?.message}
          {...form.register("email")}
        />
        <AccountPasswordField
          id="signin-password"
          label="Password"
          autoComplete="current-password"
          required
          disabled={busy}
          error={errors.password?.message}
          {...form.register("password")}
        />
        <button
          type="button"
          className="account-link justify-self-start"
          disabled={busy}
          onClick={() => {
            if (!submitting.current) onForgot(form.getValues("email"));
          }}
        >
          Forgot your password?
        </button>
        <button
          type="submit"
          className="account-button account-button-primary"
          disabled={busy}
        >
          {busy ? <InlineLoader message="Signing in..." /> : "Sign in"}
        </button>
      </form>
      <p className="account-footnote">
        New to the portal?{" "}
        <Link href="/register" className="account-link">
          Find out about account invitations
        </Link>
      </p>
    </>
  );
}
export function RecoveryFields({
  initialEmail = "",
  onBack,
}: {
  initialEmail?: string;
  onBack: (email: string) => void;
}) {
  const mutation = useRequestPasswordReset();
  const form = useForm({
    resolver: zodResolver(accountRecoverySchema),
    defaultValues: { email: initialEmail },
  });
  const [failure, setFailure] = useState(""),
    [sent, setSent] = useState(false),
    [attempt, setAttempt] = useState(0);
  const submitting = useRef(false),
    summary = useRef<HTMLDivElement>(null),
    confirmation = useRef<HTMLDivElement>(null);
  const { errors, isSubmitting } = form.formState,
    busy = mutation.isPending || isSubmitting;
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  useEffect(() => {
    if (sent) confirmation.current?.focus();
  }, [sent]);
  async function submit(values: { email: string }) {
    if (submitting.current) return;
    submitting.current = true;
    setFailure("");
    setSent(false);
    try {
      await mutation.mutateAsync(values);
      setSent(true);
    } catch (error) {
      setFailure(accountFailure(error, "request"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }
  return (
    <>
      <form
        className="account-form"
        aria-label="Request password reset"
        method="post"
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
          prefix="recovery-"
        />
        {sent && (
          <div
            ref={confirmation}
            tabIndex={-1}
            role="status"
            className="account-feedback account-feedback-success"
          >
            <h2>Check your email</h2>
            <p>
              If an active account matches that email, a reset link will be
              sent. Check your inbox and spam folder. Use the most recent link.
            </p>
          </div>
        )}
        <AccountField
          id="recovery-email"
          label="Email address"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={191}
          required
          disabled={busy}
          error={errors.email?.message}
          {...form.register("email")}
        />
        <button
          type="submit"
          className="account-button account-button-primary"
          disabled={busy}
        >
          {busy ? (
            <InlineLoader message="Requesting a link..." />
          ) : sent ? (
            "Request another link"
          ) : (
            "Send reset link"
          )}
        </button>
        <button
          type="button"
          className="account-button account-button-secondary"
          disabled={busy}
          onClick={() => {
            if (!submitting.current) onBack(form.getValues("email"));
          }}
        >
          Back to sign in
        </button>
      </form>
      <p className="account-footnote">
        If you have not been invited yet,{" "}
        <Link href="/register" className="account-link">
          learn how to get access
        </Link>
        .
      </p>
    </>
  );
}
