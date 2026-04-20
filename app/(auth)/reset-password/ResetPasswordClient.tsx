"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useResetPassword } from "@/app/modules/auth/hooks/useResetPassword";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const { mutate, isPending } = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError("Invalid setup link");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError(null);

    mutate(
      { token, password },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => router.push("/login"), 2000);
        },
        onError: (error: any) => {
          console.error("SET PASSWORD ERROR:", error);

          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong";

          setError(message);
        },
      },
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--bg-dark)] text-[var(--text-primary)]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[var(--card-elevated)] blur-3xl opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md space-y-10">
        {/* Branding */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold tracking-wide">
            Church of Christ at Redcross
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Internal Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-3 py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 mx-auto">
                <svg
                  className="w-7 h-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <p className="text-lg font-semibold">Password Set Successfully</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  Account Setup
                </p>

                <h2 className="text-xl font-semibold">Set your password</h2>

                <p className="text-sm text-[var(--text-secondary)]">
                  Choose a secure password to protect your member account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="text-sm text-red-300 bg-[var(--card-elevated)] border border-red-400 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                      focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                      outline-none text-sm text-[var(--text-primary)]
                      transition-all duration-200"
                  />
                </div>

                {/* Confirm */}
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]
                      focus:border-[var(--main-gold)] focus:ring-1 focus:ring-[var(--main-gold)]
                      outline-none text-sm text-[var(--text-primary)]
                      transition-all duration-200"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200 disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Set Password"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Scripture */}
        <p className="text-xs text-[var(--text-secondary)] text-center italic">
          “Let all things be done decently and in order.” – 1 Corinthians 14:40
        </p>
      </div>
    </div>
  );
}
