"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AlertBox from "./AlertBox";
import CompanyPicker from "./CompanyPicker";
import SideBar from "./SideBar";
import useLogState from "../services/LogoutState";
import usePickerState from "../services/PickerState";

export default function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { alertState } = useLogState();
  const { pickerState, forceShowPicker } = usePickerState();

  useEffect(() => {
    // Force show the picker after successful login
    forceShowPicker();
  }, [forceShowPicker]);

  return (
    <>
      {alertState && <AlertBox isLogout={true} />}
      {pickerState && <CompanyPicker />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-4">{children}</section>
    </>
  );
}
