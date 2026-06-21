"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NavBar from "../auth/components/NavBar";
import FooterBar from "../auth/components/FooterBar";
import EmployeeInvitationForm from "./components/EmployeeInvitationForm";

function InvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <main className="flex flex-col min-h-screen justify-between mx-auto overflow-x-hidden bg-gradient-to-br from-white via-gray-100 to-gray-200 bg-[url('/images/bgpattern.png')] bg-blend-overlay bg-cover bg-no-repeat bg-center">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4 py-8 mt-[90px]">
        <EmployeeInvitationForm token={token} />
      </div>
      <FooterBar />
    </main>
  );
}

export default function EmployeeInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InvitationContent />
    </Suspense>
  );
}
