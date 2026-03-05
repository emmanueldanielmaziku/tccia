"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { usePasswordChangeState, useFormState } from "../services/FormStates";
import { useRouter } from "next/navigation";
import { InfoCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useApiWithSessionHandling } from "../../hooks/useApiWithSessionHandling";

// Base password validation
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain letters")
  .regex(/[0-9]/, "Password must contain numbers");

// Function to create schema based on whether old_password is required
const createPasswordChangeSchema = (requireOldPassword: boolean) => {
  const baseSchema = z.object({
    new_password: passwordValidation,
    confirm_password: z.string(),
  });

  if (requireOldPassword) {
    return baseSchema
      .extend({
        old_password: z.string().min(1, "Current password is required"),
      })
      .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
  } else {
    return baseSchema.refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    });
  }
};

type FormData = {
  old_password?: string;
  new_password: string;
  confirm_password: string;
};

export default function ChangePassword() {
  const router = useRouter();
  const tf = useTranslations("forms");
  const t = useTranslations();
  const {
    stopPasswordChange,
    passwordChangeLogin,
    passwordChangeMessage,
    passwordChangeUserRole,
  } = usePasswordChangeState();
  const { toggleFormType, formType } = useFormState();
  const { fetchWithSessionHandling } = useApiWithSessionHandling();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // For employees, old_password is not required
  const isEmployee = passwordChangeUserRole === "employee";
  const schema = createPasswordChangeSchema(!isEmployee);

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
    setSuccess(null);

    try {
      let response;
      let result;

      // Use the standard endpoint from README: /api/user/change-password
      // For employees during login, we pass login credentials (no token needed)
      // For employees, old_password is not required per README
      const requestBody: any = {
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      };

      // Add login if this is an employee password change during login (no token)
      if (isEmployee && passwordChangeLogin) {
        requestBody.login = passwordChangeLogin;
      } else if (!isEmployee && data.old_password) {
        // For regular users, include old_password
        requestBody.old_password = data.old_password;
      }

      response = await fetchWithSessionHandling("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      result = await response.json();

      if (!response.ok || result.result?.error) {
        throw new Error(result.result?.error || tf("messages.passwordChangeFailed"));
      }

      setSuccess(tf("messages.passwordChangeSuccess"));

      // Return to login after successful password change
      setTimeout(() => {
        stopPasswordChange();
        if (formType === "register") {
          toggleFormType();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
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
          {tf("messages.passwordChangeTitle")}
        </div>
      </div>

      {passwordChangeMessage && (
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-blue-500 bg-blue-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="blue" />
          <p className="text-blue-700 text-xs sm:text-[15px] font-semibold">
            {passwordChangeMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-red-500 bg-red-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="red" />
          <p className="text-red-600 text-xs sm:text-[15px] font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-green-500 bg-green-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="green" />
          <p className="text-green-700 text-xs sm:text-[15px] font-semibold">{success}</p>
        </div>
      )}

      {!isEmployee && (
        <div className="relative flex flex-col gap-1 w-full">
          <label htmlFor="old_password" className="text-gray-700 text-xs sm:text-sm font-medium">
            {tf("labels.currentPassword")}
          </label>
          <input
            id="old_password"
            type={showOldPassword ? "text" : "password"}
            placeholder={tf("placeholders.enterCurrentPassword")}
            {...register("old_password")}
            className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400"
          >
            {showOldPassword ? (
              <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            ) : (
              <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
            )}
          </button>
          {errors.old_password && (
            <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
              {tf("validation.currentPasswordRequired")}
            </p>
          )}
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="new_password" className="text-gray-700 text-xs sm:text-sm font-medium">
          {tf("labels.newPassword")}
        </label>
        <input
          id="new_password"
          type={showNewPassword ? "text" : "password"}
          placeholder={tf("placeholders.enterNewPassword")}
          {...register("new_password")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400"
        >
          {showNewPassword ? (
            <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          )}
        </button>
        {errors.new_password && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {errors.new_password.type === "min"
              ? tf("validation.passwordMinLength")
              : errors.new_password.type === "regex"
              ? tf("validation.passwordLetters")
              : tf("validation.passwordNumbers")}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label
          htmlFor="confirm_password"
          className="text-gray-700 text-xs sm:text-sm font-medium"
        >
          {tf("labels.confirmNewPassword")}
        </label>
        <input
          id="confirm_password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder={tf("placeholders.confirmNewPassword")}
          {...register("confirm_password")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400"
        >
          {showConfirmPassword ? (
            <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
          )}
        </button>
        {errors.confirm_password && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {tf("validation.passwordsDoNotMatch")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-xs sm:text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          "Change Password"
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          stopPasswordChange();
          if (formType === "register") {
            toggleFormType();
          }
        }}
        className="text-gray-600 text-xs sm:text-[14px] underline"
      >
        Back to login
      </button>
    </form>
  );
}

