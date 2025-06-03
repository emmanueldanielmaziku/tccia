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
  const router = useRouter();
  const { alertState } = useLogState();
  const { pickerState } = usePickerState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (!response.ok) {
          router.push("/auth");
        }
      } catch (error) {
        router.push("/auth");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <>
      {alertState && <AlertBox />}
      {pickerState && <CompanyPicker />}
      <SideBar />
      <section className="flex-1 bg-gray-50 pr-4">{children}</section>
    </>
  );
}
