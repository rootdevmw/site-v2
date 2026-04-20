"use client";

import { GuestGuard } from "@/app/modules/auth/components/GuestGuard";
import { RegisterForm } from "@/app/modules/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--bg-dark)] text-[var(--text-primary)]">
        {/* Soft ambient glow */}
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
            <div className="text-center space-y-1">
              <h2 className="text-xl font-medium">Create Account</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Sign up for access
              </p>
            </div>

            <RegisterForm />
          </div>

          {/* Scripture */}
          <p className="text-xs text-[var(--text-secondary)] text-center italic">
            "For where two or three are gathered together in my name, there am I
            in the midst of them." – Matthew 18:20
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
