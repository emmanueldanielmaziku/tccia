"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AlertBox from "./AlertBox";
import CompanyPicker from "./CompanyPicker";
import SideBar from "./SideBar";
import useLogState from "../services/LogoutState";
import usePickerState from "../services/PickerState";
import { useApiWithSessionHandling } from "@/app/hooks/useApiWithSessionHandling";

export default function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { alertState } = useLogState();
  const { pickerState, forceShowPicker } = usePickerState();
  const { fetchWithSessionHandling } = useApiWithSessionHandling();
  const router = useRouter();

  // Validate token on layout mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Make a test call to a protected endpoint to validate the token
        const response = await fetchWithSessionHandling('/api/user_profile');
        
        if (!response.ok) {
          // If the token is invalid, the session handlers will trigger
          // and redirect to login, so we don't need to do anything here
          console.log('Token validation failed, session handlers will manage redirect');
        }
      } catch (error) {
        // Session expired errors are handled by the session management system
        if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
          console.log('Session expired during token validation');
        } else {
          console.error('Unexpected error during token validation:', error);
        }
      }
    };

    // Only validate if we're in a client environment
    if (typeof window !== 'undefined') {
      validateToken();
    }

    forceShowPicker();
  }, [forceShowPicker, fetchWithSessionHandling]);

  return (
    <>
      {alertState && <AlertBox isLogout={true} />}
      {pickerState && <CompanyPicker />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-4">{children}</section>
    </>
  );
}
