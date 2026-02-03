"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useFormState, useResetFormState } from "../services/FormStates";
import { useRouter } from "next/navigation";
import { Call, InfoCircle, Sms } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useApiWithSessionHandling } from "../../hooks/useApiWithSessionHandling";
import { handleSessionError } from "../../utils/sessionErrorHandler";
import { useOtpVerificationState } from "../services/FormStates";


const schema = z.object({
  login: z
    .string()
    .min(1, "Email or phone number is required")
    .refine(
      (value) => {
        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if it's a valid phone number (10+ digits)
        const phoneRegex = /^[0-9]{10,}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
      {
        message: "Please enter a valid email address or phone number",
      }
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain numbers"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleFormType } = useFormState();
  const { resetForm } = useResetFormState();
  const { startOtp } = useOtpVerificationState();
  const t = useTranslations();
  const tf = useTranslations("forms");
  const { fetchWithSessionHandling } = useApiWithSessionHandling();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithSessionHandling("/api/auth/user_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Login response:", result);

      // OTP verification required
      if (response.status === 403 && result.result?.need_otp_verification) {
        startOtp({
          login: data.login,
          message:
            result.result?.error ||
            "Account not verified. Please enter the OTP sent to your phone/email.",
        });
        return;
      }

      if (!response.ok || result.result?.error) {
        const errorMessage = result.result?.error || tf("messages.loginFailed");
        console.log("Login error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (result.result?.token) {
        setIsSubmitting(false);
        router.push("/client/firm-management");
      } else {
        throw new Error(tf("messages.invalidResponse"));
      }
    } catch (error) {
      // Handle session expired errors gracefully
      if (handleSessionError(error)) {
        setIsSubmitting(false);
        return;
      }
      
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : tf("messages.loginFailed");
      console.log("Setting error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 sm:mt-12 md:mt-[30px] flex flex-col space-y-4 sm:space-y-5 w-full md:w-[480px] border p-4 sm:p-6 rounded-[10px] sm:rounded-[12px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <div className="text-gray-700 font-semibold text-sm sm:text-[16px] md:text-2xl">
          {t("common.welcome")}
        </div>
      </div>

      {error && (
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-red-500 bg-red-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full animate-pulse">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="red" />
          <p className="text-red-600 text-xs sm:text-[15px] font-semibold">{error}</p>
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="login" className="text-gray-700 text-xs sm:text-sm font-medium">
          {tf("labels.emailOrPhone")}
        </label>
        <input
          type="text"
          placeholder={tf("placeholders.enterEmailOrPhone")}
          {...register("login")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <Sms size="16" color="#9F9FA9" className="absolute top-8 sm:top-9.5 right-3 sm:right-5" />
        {errors.login && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {errors.login.message}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="password" className="text-gray-700 text-xs sm:text-sm font-medium">
          {t("common.password")}
        </label>
        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder={tf("placeholders.enterPassword")}
          {...register("password")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          aria-label={
            isPasswordVisible
              ? tf("buttons.hidePassword")
              : tf("buttons.showPassword")
          }
          className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400"
        >
          {isPasswordVisible ? (
            <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          )}
        </button>
        {errors.password && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {errors.password.type === "min"
              ? tf("validation.passwordMinLength")
              : errors.password.type === "regex"
              ? tf("validation.passwordLetters")
              : tf("validation.passwordNumbers")}
          </p>
        )}
      </div>

      {/* <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-xs sm:text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          t("common.login")
        )}d
      </button> */}

<div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
<div className="flex items-center space-x-2 sm:space-x-4">
        <button
          type="button"
          className="text-[12px] sm:text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          {t("common.createAccount")}
        </button>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          type="button"
          className="text-[12px] sm:text-[14px] text-red-600 underline cursor-pointer"
          onClick={resetForm}
        >
          {t("common.resetPassword")}
        </button>
      </div>
</div>
    </form>
  );
}
