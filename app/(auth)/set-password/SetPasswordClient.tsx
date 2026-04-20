"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSetPassword } from "@/app/modules/auth/hooks/useSetPassword";
import { useState } from "react";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function SetPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const { mutateAsync, isPending } = useSetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) return showError("Invalid or expired setup link");

    if (!password || !confirm) {
      return showError("All fields are required");
    }

    if (password.length < 6) {
      return showError("Password must be at least 6 characters");
    }

    if (password !== confirm) {
      return showError("Passwords do not match");
    }

    try {
      await mutateAsync({ token, password });

      showSuccess("Password set successfully. Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to set password";
      showError(msg);
    }
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
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Account Setup
            </p>
            <h2 className="text-xl font-medium text-[var(--text-primary)]">
              Set your password
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Choose a secure password to protect your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="New Password"
              value={password}
              setValue={setPassword}
              show={showPassword}
              setShow={setShowPassword}
              placeholder="At least 6 characters"
            />

            <Field
              label="Confirm Password"
              value={confirm}
              setValue={setConfirm}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Repeat your password"
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[var(--main-gold)] hover:bg-[var(--gold-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 active:scale-[0.98]"
            >
              {isPending ? (
                <SpiritualLoader message="Saving..." />
              ) : (
                "Set Password"
              )}
            </button>
          </form>
        </div>

        {/* Scripture (optional but consistent with login page) */}
        <p className="text-xs text-[var(--text-secondary)] text-center italic">
          “Let all things be done decently and in order.” – 1 Corinthians 14:40
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Field */
/* ---------------------------------- */

function Field({
  label,
  value,
  setValue,
  show,
  setShow,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </label>

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--main-gold)]/40 focus:border-[var(--main-gold)] transition"
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-[32px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
