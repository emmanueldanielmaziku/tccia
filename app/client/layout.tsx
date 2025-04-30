import SideBar from "./components/SideBar";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gray-100 flex gap-5 items-center h-lvh flex-row pr-4 font-[family-name:var(--font-geist-sans)]">
      <SideBar />
      <section className="flex-1">{children}</section>
    </main>
  );
}
