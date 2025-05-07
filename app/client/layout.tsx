"use client"
import AlertBox from "./components/AlertBox";
import SideBar from "./components/SideBar";
import useLogState from "./services/LogoutState";

export default function ClientRoot({ children }: {
  children: React.ReactNode;
}) {

  const { alertState } = useLogState();
  
  return (
    <main className="bg-gray-50 flex gap-1 items-center h-lvh flex-row font-[family-name:var(--font-geist-sans)] relative">
      { alertState && <AlertBox />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-4">
        {children}
      </section>
    </main>
  );
}