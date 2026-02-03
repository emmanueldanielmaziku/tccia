import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LanguageProvider from "./providers/LanguageProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionExpiredProvider } from "./services/SessionExpiredService";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TNCC",
  description: "Tanzania National Chamber of Commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#007bff" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <SessionExpiredProvider>{children}</SessionExpiredProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
