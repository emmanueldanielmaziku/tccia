"use client";
import ActivateAccount from "./components/ActivateAccount";
import FooterBar from "./components/FooterBar";
import { TextGenerateEffect } from "./components/GenerativeTitle";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import RegForm from "./components/RegForm";
import ResetPassword from "./components/ResetPassword";
import NTBPortal from "./components/NTBPortal";
import {
  useActivateAccountState,
  useFormState,
  useResetFormState,
} from "./services/FormStates";
import { useAuthLayoutState } from "./services/AuthLayoutState";

export default function AuthLayout() {
  const words = `"Private Sector, the Engine of Growth"`;

  const { formType } = useFormState();
  const { formTypo } = useResetFormState();
  const { isActivated } = useActivateAccountState();
  const { showNTB, setShowNTB } = useAuthLayoutState();

  const handleBackToAuth = () => {
    setShowNTB(false);
  };

  return (
    <main className="flex flex-col min-h-screen justify-between mx-auto overflow-x-hidden bg-gradient-to-br from-white via-gray-100 to-gray-200 bg-[url('/images/bgpattern.png')] bg-blend-overlay overla bg-cover bg-no-repeat bg-center">
      <NavBar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {showNTB ? (
          <NTBPortal onBack={handleBackToAuth} />
        ) : (
          <div className="w-full flex flex-col justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-4 mt-[120px] mb-4 max-w-[900px]">
              <h1 className="text-2xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                TANZANIA CHAMBER OF COMMERCE INDUSTRY AND AGRICULTURE
              </h1>
              <TextGenerateEffect words={words} className="text-lg md:text-[20px] text-gray-700 text-center italic" />
            </div>
            {isActivated ? (
              <ActivateAccount />
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
