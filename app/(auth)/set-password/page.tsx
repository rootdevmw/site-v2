import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";
import {
  AccountShell,
  AccountLoading,
} from "@/components/accounts/AccountShell";
export default function Page() {
  return (
    <Suspense
      fallback={
        <AccountShell
          title="Set your password"
          description="Preparing your account link."
        >
          <AccountLoading />
        </AccountShell>
      }
    >
      <SetPasswordClient />
    </Suspense>
  );
}
