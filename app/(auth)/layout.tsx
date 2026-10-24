import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/accounts.css";
const accountFont = localFont({
  src: "../../public/fonts/manrope-variable.ttf",
  variable: "--font-account-body",
  weight: "200 800",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Church portal | Church of Christ at Red Cross",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={accountFont.variable}>{children}</div>;
}
