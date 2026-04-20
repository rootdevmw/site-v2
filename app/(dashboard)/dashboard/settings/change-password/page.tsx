"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChangePassword } from "@/app/modules/auth/hooks/useChangePassword";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { logout } from "@/app/modules/auth/api/logout"; // <-- important

export default function ChangePasswordPage() {
  const { mutateAsync, isPending } = useChangePassword();
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!current || !password || !confirm) {
      return showError("All fields are required");
    }

    if (password.length < 6) {
      return showError("Password must be at least 6 characters");
    }

    if (password !== confirm) {
      return showError("Passwords do not match");
    }

    try {
      await mutateAsync({
        currentPassword: current,
        newPassword: password,
      });

      showSuccess("Password updated successfully. Please sign in again.");

      // Small delay so user sees the toast
      setTimeout(async () => {
        await logout(); // clears cookie + store
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update password";
      showError(msg);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Change Password
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Keep your account secure by using a strong password.
        </p>
      </div>

      {/* Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl overflow-hidden shadow-sm">
        {/* Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--main-gold)] via-yellow-300 to-[var(--main-gold)]" />

        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Current Password"
              value={current}
              setValue={setCurrent}
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Enter your current password"
            />

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
              placeholder="Repeat your new password"
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[var(--main-gold)] hover:bg-[var(--gold-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 active:scale-[0.98]"
            >
              {isPending ? (
                <SpiritualLoader message="Updating..." />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-soft)] bg-[var(--card-elevated)] px-8 py-4">
          <p className="text-xs text-[var(--text-secondary)] text-center">
            Use a strong password you don’t reuse elsewhere.
          </p>
        </div>
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
