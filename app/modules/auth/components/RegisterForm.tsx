import Link from "next/link";
export function RegisterForm() {
  return (
    <>
      <ol className="account-invitation-steps">
        <li>
          Contact the church team and share the email address you want to use.
        </li>
        <li>
          Once your account is ready, look for the invitation email and choose
          Set your password.
        </li>
        <li>
          Sign in with that email and password. The church team will arrange the
          access needed for your responsibilities.
        </li>
      </ol>
      <div className="account-actions mt-6">
        <Link href="/contact" className="account-button account-button-primary">
          Contact the church team
        </Link>
        <Link href="/login" className="account-button account-button-secondary">
          Sign in
        </Link>
      </div>
      <p className="account-footnote">
        Already invited, but the link has expired?{" "}
        <Link href="/login?mode=forgot" className="account-link">
          Request a fresh password link
        </Link>
        .
      </p>
    </>
  );
}
