"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useOtpVerificationState, useFormState } from "../services/FormStates";

export default function VerifyOtp() {
  const tf = useTranslations("forms");
  const t = useTranslations();
  const { stopOtp, otpLogin, otpMessage, startOtp } = useOtpVerificationState();
  const { toggleFormType, formType } = useFormState();

  const [login, setLogin] = useState(otpLogin ?? "");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (otpLogin) setLogin(otpLogin);
  }, [otpLogin]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!login.trim()) {
      setError("Login is required");
      return;
    }
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { login: login.trim(), otp: otp.trim() };
      console.log("[OTP] Submitting verify_otp payload:", payload);
      const response = await fetch("/api/auth/verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("[OTP] verify_otp response:", {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok || result.result?.error || result.error) {
        throw new Error(result.result?.error || result.error || result.message || "OTP verification failed");
      }

      setSuccess(result.result?.message || result.message || "Account verified successfully. You can now login.");

      // Return to login
      setTimeout(() => {
        stopOtp();
        // Ensure auth screen shows login (only toggle if currently on register)
        if (formType === "register") {
          toggleFormType();
        }
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);

    if (!login.trim()) {
      setError("Login is required");
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/user_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim(), resend_otp: true }),
      });
      const result = await response.json();

      // Backend returns 403 with need_otp_verification=true and message when resent
      if (response.status === 403 && result.result?.need_otp_verification) {
        setSuccess(result.result?.error || "New OTP sent. Please check your phone/email.");
        startOtp({ login: login.trim(), message: result.result?.error });
        return;
      }

      if (!response.ok || result.result?.error) {
        throw new Error(result.result?.error || "Failed to resend OTP");
      }

      setSuccess("New OTP sent. Please check your phone/email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      onSubmit={handleVerify}
      className="mt-8 sm:mt-12 md:mt-[30px] flex flex-col space-y-4 sm:space-y-5 w-full md:w-[480px] border p-4 sm:p-6 rounded-[10px] sm:rounded-[12px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <div className="text-gray-700 font-semibold text-sm sm:text-[16px] md:text-2xl">
          {t("common.verifyAccount") ?? "Verify Account"}
        </div>
      </div>

      {otpMessage && (
        <div className="border border-blue-300 bg-blue-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <p className="text-blue-700 text-xs sm:text-[14px] font-semibold">{otpMessage}</p>
        </div>
      )}

      {error && (
        <div className="border-2 border-red-500 bg-red-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <p className="text-red-600 text-xs sm:text-[15px] font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="border-2 border-green-500 bg-green-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <p className="text-green-700 text-xs sm:text-[15px] font-semibold">{success}</p>
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="otp-login" className="text-gray-700 text-xs sm:text-sm font-medium">
          {tf("labels.emailOrPhone") ?? "Email or phone"}
        </label>
        <input
          id="otp-login"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
          placeholder={tf("placeholders.enterEmailOrPhone") ?? "Enter email or phone"}
        />
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="otp" className="text-gray-700 text-xs sm:text-sm font-medium">
          OTP
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
          placeholder="Enter OTP"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-500 text-white text-sm md:text-[16px] px-4 py-2 rounded-[8px] hover:bg-blue-600 disabled:bg-gray-300"
      >
        {submitting ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        disabled={resending}
        onClick={handleResend}
        className="border-blue-500 border-2 text-blue-500 text-sm md:text-[16px] px-4 py-2 rounded-[8px] hover:text-blue disabled:bg-gray-200"
      >
        {resending ? "Resending..." : "Resend OTP"}
      </button>

      <button
        type="button"
        onClick={() => {
          stopOtp();
          // Ensure login view (only toggle if currently on register)
          if (formType === "register") {
            toggleFormType();
          }
        }}
        className="text-gray-600 text-sm underline"
      >
        Back to login
      </button>
    </form>
  );
}


