import { GuestGuard } from "@/app/modules/auth/components/GuestGuard";
import { LoginForm } from "@/app/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <GuestGuard>
      <div
        className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[var(--bg-dark)] text-[var(--text-primary)]"
      >
        {/* Soft ambient glow */}
        <div className="absolute inset-0 bg-[var(--card-elevated)] blur-3xl opacity-40 pointer-events-none" />

        <div className="relative w-full max-w-md space-y-10">
          {/* Branding */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-semibold tracking-wide">
              Church of Christ at Redcross
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">Internal Management System</p>
          </div>

          {/* Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-medium">Welcome back</h2>
              <p className="text-sm text-[var(--text-secondary)]">Sign in to continue</p>
            </div>

            <LoginForm />
          </div>

          {/* Scripture */}
          <p className="text-xs text-[var(--text-secondary)] text-center italic">
            “Let all things be done decently and in order.” – 1 Corinthians
            14:40
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
