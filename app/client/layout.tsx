"use client"
import AlertBox from "./components/AlertBox";
import CompanyPicker from "./components/CompanyPicker";
import SideBar from "./components/SideBar";
import useLogState from "./services/LogoutState";
import usePickerState from "./services/PickerState";

export default function ClientRoot({ children }: {
  children: React.ReactNode;
}) {

  const { alertState } = useLogState();
  const { pickerState } = usePickerState();
  
  return (
    <main className="bg-gray-50 flex gap-1 items-center h-lvh flex-row font-[family-name:var(--font-geist-sans)] relative">
      {alertState && <AlertBox />}
      {pickerState && <CompanyPicker />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-4">
        {children}
      </section>
    </main>
  );
}