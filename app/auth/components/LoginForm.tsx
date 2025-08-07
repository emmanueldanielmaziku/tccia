"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useFormState, useResetFormState } from "../services/FormStates";
import { useRouter } from "next/navigation";
import { Call } from "iconsax-reactjs";
import { useTranslations } from "next-intl";


const schema = z.object({
  login: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
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
  const t = useTranslations();
  const tf = useTranslations("forms");

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
      const response = await fetch("/api/auth/user_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || result.result?.error) {
        throw new Error(result.result?.error || tf("messages.loginFailed"));
      }

      if (result.result?.token) {
        router.push("/client/firm-management");
      } else {
        throw new Error(tf("messages.invalidResponse"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : tf("messages.loginFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-12 md:mt-[50px] flex flex-col space-y-5 w-full md:w-[480px] border p-6 rounded-[12px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          {t("common.welcome")}
        </div>
      </div>

      {error && (
        <div className="flex flex-row items-center space-x-4 border border-red-500 bg-red-100 rounded-[8px] p-4 w-full">
          <p className="text-red-500 text-[15px] font-semibold">{error}</p>
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="phone" className="text-gray-700 text-sm font-medium">
          {tf("labels.phoneNumber")}
        </label>
        <input
          type="tel"
          placeholder={tf("placeholders.enterPhone")}
          {...register("login")}
          className="w-full px-6 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <Call size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />
        {errors.login && (
          <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
            {errors.login.type === "min"
              ? tf("validation.phoneMinLength")
              : tf("validation.phoneDigitsOnly")}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="password" className="text-gray-700 text-sm font-medium">
          {t("common.password")}
        </label>
        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder={tf("placeholders.enterPassword")}
          {...register("password")}
          className="w-full px-6 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          aria-label={
            isPasswordVisible
              ? tf("buttons.hidePassword")
              : tf("buttons.showPassword")
          }
          className="absolute top-9.5 right-5 text-zinc-400"
        >
          {isPasswordVisible ? (
            <MdVisibilityOff className="w-5 h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-5 h-5 cursor-pointer" />
          )}
        </button>
        {errors.password && (
          <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
            {errors.password.type === "min"
              ? tf("validation.passwordMinLength")
              : errors.password.type === "regex"
              ? tf("validation.passwordLetters")
              : tf("validation.passwordNumbers")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-6 py-2.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          t("common.login")
        )}
      </button>

<div className="flex flex-row justify-between items-center">
<div className="flex items-center space-x-4">
        {/* <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {tf("messages.noAccount")}
        </span> */}
        <button
          type="button"
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          {t("common.createAccount")}
        </button>
      </div>
      <div className="flex items-center space-x-4">
        {/* <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {tf("messages.forgotPassword")}
        </span> */}
        <button
          type="button"
          className="text-[14px] text-red-600 underline cursor-pointer"
          onClick={resetForm}
        >
          {t("common.resetPassword")}
        </button>
      </div>
</div>
    </form>
  );
}
