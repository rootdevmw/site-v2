import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function AccountShell({
  eyebrow = "Church portal",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="account-shell">
      <a href="#account-content" className="account-skip">
        Skip to account form
      </a>
      <div className="account-wrap">
        <nav aria-label="Account navigation" className="account-navigation">
          <Link href="/" className="account-link">
            Back to the church website
          </Link>
          <Link href="/contact" className="account-link">
            Need help?
          </Link>
        </nav>
        <div className="account-layout">
          <aside className="account-welcome" aria-label="Church welcome">
            <Link href="/" className="account-brand">
              <Image
                src="/logos/full-logo.png"
                width={64}
                height={64}
                alt=""
                className="object-cover"
              />
              <span>
                Church of Christ<span>at Red Cross</span>
              </span>
            </Link>
            <div className="account-welcome-copy">
              <p className="account-eyebrow">One church family</p>
              <h2>
                Here to serve.
                <br />
                Growing together.
              </h2>
              <p>
                A shared place to care for our congregation, prepare for worship
                and support the life of the church.
              </p>
            </div>
            <p className="account-welcome-note">Blantyre, Malawi</p>
          </aside>
          <main id="account-content" tabIndex={-1} className="account-card">
            <header className="account-heading">
              <p className="account-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
export function AccountLoading({
  message = "Preparing your account page...",
}: {
  message?: string;
}) {
  return (
    <div className="account-loading">
      <InlineLoader message={message} />
    </div>
  );
}
