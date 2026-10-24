import { Suspense } from "react";
import { LoginForm } from "@/app/modules/auth/components/LoginForm";
import {
  AccountShell,
  AccountLoading,
} from "@/components/accounts/AccountShell";
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AccountShell title="Sign in" description="Your church portal account.">
          <AccountLoading />
        </AccountShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
