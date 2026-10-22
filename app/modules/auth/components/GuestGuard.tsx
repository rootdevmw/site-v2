"use client";
import Link from "next/link";
import { useAuthStore } from "../store/auth.store";
import { AccountLoading } from "@/components/accounts/AccountShell";
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized)
    return <AccountLoading message="Checking your session..." />;
  return (
    <>
      {user && (
        <div className="account-feedback mb-6" role="status">
          <p>Continue to the dashboard, or sign in again below.</p>
          <Link href="/dashboard" className="account-link">
            Continue to the dashboard
          </Link>
        </div>
      )}
      {children}
    </>
  );
}
