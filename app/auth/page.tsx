"use client";
import ActivateAccount from "./components/ActivateAccount";
import FooterBar from "./components/FooterBar";
import { TextGenerateEffect } from "./components/GenerativeTitle";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import RegForm from "./components/RegForm";
import ResetPassword from "./components/ResetPassword";
import NewPassword from "./components/NewPassword";
import HelpDeskPortal from "./components/HelpDeskPortal";
import VerifyOtp from "./components/VerifyOtp";
import {
  useActivateAccountState,
  useFormState,
  useResetFormState,
} from "./services/FormStates";
import { useOtpVerificationState } from "./services/FormStates";
import { useAuthLayoutState } from "./services/AuthLayoutState";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthContent() {
  const words = `"Private Sector, the Engine of Growth"`;
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  const { formType } = useFormState();
  const { formTypo } = useResetFormState();
  const { isActivated } = useActivateAccountState();
  const { otpActive } = useOtpVerificationState();
  const { showHelpDesk, setShowHelpDesk } = useAuthLayoutState();

  const handleBackToAuth = () => {
    setShowHelpDesk(false);
  };

  return (
    <main className="flex flex-col min-h-screen justify-between mx-auto overflow-x-hidden bg-gradient-to-br from-white via-gray-100 to-gray-200 bg-[url('/images/bgpattern.png')] bg-blend-overlay overla bg-cover bg-no-repeat bg-center">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {showHelpDesk ? (
          <HelpDeskPortal onBack={handleBackToAuth} />
        ) : (
          <div className="w-full flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-4 mt-[90px] max-w-[900px] w-full px-4 sm:px-6 md:px-8">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent leading-tight px-2">
                TANZANIA CHAMBER OF COMMERCE INDUSTRY AND AGRICULTURE
              </h1>
              <TextGenerateEffect words={words} className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center italic px-2" />
            </div>
            {otpActive ? (
              <VerifyOtp />
            ) : isActivated ? (
              <ActivateAccount />
            ) : resetToken ? (
              <NewPassword token={resetToken} />
            ) : formTypo === "reset" ? (
              <ResetPassword />
            ) : formType === "register" ? (
              <RegForm />
            ) : (
              <LoginForm />
            )}
          </div>
        )}
      </div>
      <FooterBar />
    </main>
  );
}

export default function AuthLayout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
