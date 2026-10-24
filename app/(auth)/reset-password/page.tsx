import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";
import {
  AccountShell,
  AccountLoading,
} from "@/components/accounts/AccountShell";
export default function Page() {
  return (
    <Suspense
      fallback={
        <AccountShell
          title="Reset your password"
          description="Preparing your account link."
        >
          <AccountLoading />
        </AccountShell>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
