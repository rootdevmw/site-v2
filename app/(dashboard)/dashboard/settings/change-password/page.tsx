import { ChangePasswordForm } from "@/components/accounts/ChangePasswordForm";
import "@/styles/accounts.css";
export default function ChangePasswordPage() {
  return (
    <article
      className="account-settings"
      aria-labelledby="account-settings-title"
    >
      <header className="account-heading">
        <p className="account-eyebrow">Your account</p>
        <h1 id="account-settings-title">Change password</h1>
        <p>Update the password you use for the church portal.</p>
      </header>
      <div className="account-card">
        <ChangePasswordForm />
      </div>
    </article>
  );
}
