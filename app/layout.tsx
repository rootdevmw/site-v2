import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/app/modules/auth/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--card-bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-soft)",
              borderRadius: "12px",
              padding: "12px 14px",
            },
            success: {
              iconTheme: {
                primary: "var(--main-gold)",
                secondary: "black",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "white",
              },
            },
          }}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
