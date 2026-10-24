import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/app/modules/auth/components/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('redcross_theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
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
                  primary: "var(--brand-orange)",
                  secondary: "var(--brand-ink)",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
