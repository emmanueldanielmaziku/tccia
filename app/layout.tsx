import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LanguageProvider from "./providers/LanguageProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TCCIA",
  description: "Tanzania Chamber of Commerce, Industry and Agriculture",
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
