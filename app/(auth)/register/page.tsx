import { AccountShell } from "@/components/accounts/AccountShell";
import { RegisterForm } from "@/app/modules/auth/components/RegisterForm";
export default function RegisterPage() {
  return (
    <AccountShell
      eyebrow="Account invitations"
      title="Join the church portal"
      description="Accounts are set up by the church team. An invitation helps us connect you with the right access."
    >
      <RegisterForm />
    </AccountShell>
  );
}
