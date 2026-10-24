"use client";
import { useSearchParams } from "next/navigation";
import { AccountShell } from "@/components/accounts/AccountShell";
import { AccountPasswordForm } from "@/components/accounts/AccountPasswordForm";
import { accountLinkToken } from "@/lib/utils/account-flows";
export default function ResetPasswordClient() {
  const token = accountLinkToken(useSearchParams());
  return (
    <AccountShell
      eyebrow="Password recovery"
      title="Choose a new password"
      description="Create a new password for your church portal account."
    >
      <AccountPasswordForm
        key={token ?? "invalid"}
        token={token}
        kind="reset"
      />
    </AccountShell>
  );
}
