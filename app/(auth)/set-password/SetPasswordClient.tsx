"use client";
import { useSearchParams } from "next/navigation";
import { AccountShell } from "@/components/accounts/AccountShell";
import { AccountPasswordForm } from "@/components/accounts/AccountPasswordForm";
import { accountLinkToken } from "@/lib/utils/account-flows";
export default function SetPasswordClient() {
  const token = accountLinkToken(useSearchParams());
  return (
    <AccountShell
      eyebrow="Account invitation"
      title="Set your password"
      description="Welcome to the church portal. Choose a password to finish setting up your account."
    >
      <AccountPasswordForm key={token ?? "invalid"} token={token} kind="set" />
    </AccountShell>
  );
}
