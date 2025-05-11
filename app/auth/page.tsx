"use client";
import ActivateAccount from "./components/ActivateAccount";
import FooterBar from "./components/FooterBar";
import { TextGenerateEffect } from "./components/GenerativeTitle";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import RegForm from "./components/RegForm";
import ResetPassword from "./components/ResetPassword";
import { useActivateAccountState, useFormState, useResetFormState } from "./services/FormStates";


export default function AuthLayout() {
  const words = `"Private Sector, the Engine of Growth"`;

  const { formType } = useFormState();
  const { formTypo } = useResetFormState();
  const { isActivated } = useActivateAccountState();

  return (
    <main className="flex flex-col min-h-screen justify-between mx-auto overflow-x-hidden bg-gradient-to-br from-white via-gray-100 to-gray-200 bg-[url('/images/bgpattern.png')] bg-blend-overlay overla bg-cover bg-no-repeat bg-center">
      <NavBar />

      <section className="flex flex-col gap-7 justify-between items-center px-[10px] py-4 w-full mx-auto mt-24 md:mt-[90px] md:px-14 md:py-10 lg:flex-col lg:gap-7 lg:justify-between lg:items-center lg:w-[80%] lg:mx-auto">
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <h1 className="text-[22px] md:text-5xl md:w-[70%] font-bold font-sans bg-gradient-to-r from-blue-800 via-blue-500 to-blue-400 bg-clip-text text-transparent text-center">
            Tanzania Chamber of Commerce, <br />
            Industry and Agriculture.
          </h1>
          <TextGenerateEffect words={words} />
        </div>

        <div className="flex-1 flex justify-center items-center">
          {formType === "login" ? (
            formTypo === "login" ? (
              isActivated ? (
                <LoginForm />
              ) : (
                <ActivateAccount />
              )
            ) : (
              <ResetPassword />
            )
          ) : isActivated ? (
            <RegForm />
          ) : (
            <ActivateAccount />
          )}
        </div>
      </section>

      <FooterBar />
    </main>
  );
}
