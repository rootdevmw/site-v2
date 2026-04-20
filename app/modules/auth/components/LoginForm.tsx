"use client";

import { useLogin } from "../hooks/useLogin";
import { useRequestPasswordReset } from "../hooks/useRequestPasswordReset";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const { mutate: requestReset, isPending: isResetting } =
    useRequestPasswordReset();

  const router = useRouter();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (typeof email !== "string") {
      setError("Invalid form submission");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setError(null);
    setSuccess(null);

    // -----------------------------
    // FORGOT PASSWORD FLOW
    // -----------------------------
    if (mode === "forgot") {
      requestReset(
        { email },
        {
          onSuccess: () => {
            setSuccess(
              "If an account exists, a reset link has been sent to your email.",
            );
          },
          onError: () => {
            setError("Something went wrong. Please try again.");
          },
        },
      );
      return;
    }

    // -----------------------------
    // LOGIN FLOW
    // -----------------------------
    if (typeof password !== "string" || !password) {
      setError("Please enter your password");
      return;
    }

    login(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: () => {
          setError("Invalid email or password");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      {error && (
        <div className="text-sm text-red-300 bg-[var(--card-elevated)] border border-red-400 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="text-sm text-green-300 bg-[var(--card-elevated)] border border-green-400 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1">
        <label className="text-xs text-[var(--text-secondary)]">Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                     focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                     outline-none text-sm text-[var(--text-primary)]"
        />
      </div>

      {/* Password (only in login mode) */}
      {mode === "login" && (
        <div className="space-y-1 relative">
          <label className="text-xs text-[var(--text-secondary)]">
            Password
          </label>

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                       focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                       outline-none text-sm text-[var(--text-primary)]"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-[30px] text-xs text-[var(--text-secondary)]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      )}

      {/* Toggle Forgot Password */}
      <div className="flex justify-between text-xs">
        {mode === "login" ? (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setSuccess(null);
            }}
            className="text-[var(--main-gold)] hover:underline"
          >
            Forgot password?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className="text-[var(--text-secondary)] hover:underline"
          >
            Back to login
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || isResetting}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black
                   hover:bg-[var(--gold-dark)] transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {mode === "login"
          ? isPending
            ? "Signing in..."
            : "Sign in"
          : isResetting
            ? "Sending..."
            : "Send reset link"}
      </button>
    </form>
  );
}
