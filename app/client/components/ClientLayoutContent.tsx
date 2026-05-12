"use client";

import { useEffect, useRef } from "react";
import AlertBox from "./AlertBox";
import CompanyPicker from "./CompanyPicker";
import SideBar from "./SideBar";
import useLogState from "../services/LogoutState";
import usePickerState from "../services/PickerState";
import { RightSidebarProvider } from "../../contexts/RightSidebarContext";
import { SessionTimeoutProvider } from "../../contexts/SessionTimeoutContext";
import { ResponsiveSidebarHandler } from "./ResponsiveSidebarHandler";
import { usePathname } from "next/navigation";

// Component that uses the responsive sidebar hook
function ClientLayoutWithResponsiveSidebar({ children }: { children: React.ReactNode }) {
  const { alertState } = useLogState();
  const { pickerState, forceShowPicker } = usePickerState();
  const pathname = usePathname();
  const hasCheckedPicker = useRef(false);

  const isPublicClientRoute =
    pathname?.startsWith("/client/ntb") ||
    pathname?.startsWith("/client/certificate-validity") ||
    pathname?.startsWith("/client/business-complaints");

  useEffect(() => {
    if (!hasCheckedPicker.current && !isPublicClientRoute) {
      hasCheckedPicker.current = true;
      forceShowPicker();
    }
  }, []);

  return (
    <>
      <ResponsiveSidebarHandler />
      {alertState && <AlertBox isLogout={true} />}
      {pickerState && !isPublicClientRoute && <CompanyPicker />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-2 sm:pr-4">{children}</section>
    </>
  );
}

export default function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
      <RightSidebarProvider>
        <ClientLayoutWithResponsiveSidebar>{children}</ClientLayoutWithResponsiveSidebar>
      </RightSidebarProvider>
    </SessionTimeoutProvider>
  );
}
