import { AuthGuard } from "@/app/modules/auth/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import localFont from "next/font/local";
import "@/styles/records.css";
import "@/styles/directories.css";
import "@/styles/forms.css";

const portalFont = localFont({
  src: "../../../public/fonts/manrope-variable.ttf",
  variable: "--font-portal-body",
  weight: "200 800",
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className={portalFont.variable}><DashboardLayout>{children}</DashboardLayout></div>
    </AuthGuard>
  );
}
