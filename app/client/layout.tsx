"use client";
import ClientLayoutContent from "./components/ClientLayoutContent";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gray-50 flex gap-1 items-center h-lvh flex-row font-[family-name:var(--font-geist-sans)] relative">
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </main>
  );
}
