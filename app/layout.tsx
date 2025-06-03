import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "TCCIA - Client Portal",
  description: "A comprehensive ERP system for TCCIA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        
        <meta name="theme-color" content="#007bff" />
      </head>
      <body
        className="antialiased font-sans font-medium"
      >
        {children}
      </body>
    </html>
  );
}
