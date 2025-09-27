"use client";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useApiWithSessionHandling } from "@/app/hooks/useApiWithSessionHandling";
import { useResetFormState } from "../services/FormStates";

// Custom password validation function
const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one special character";
  return undefined;
};

// Validation schema 
const schema = z.object({
  new_password: z.string().superRefine((password, ctx) => {
    const error = validatePassword(password);
    if (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error,
      });
    }
  }),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

interface NewPasswordProps {
  token: string;
}

export default function NewPassword({ token }: NewPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const { fetchWithSessionHandling } = useApiWithSessionHandling();
  const { resetForm } = useResetFormState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetchWithSessionHandling("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.result?.error) {
        throw new Error(result.result?.error || "Failed to reset password");
      }

      setMessage("Password reset successfully! You can now login with your new password.");
      setIsPasswordChanged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-12 md:mt-[50px] flex flex-col space-y-7 w-[90%] md:w-[480px] border p-6 rounded-[15px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <Image
          src="/icons/LOGO.png"
          className="w-[40px] h-[40px]"
          alt="Logo"
          width={20}
          height={20}
        />
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          Set New Password
        </div>
        <Image
          src="/icons/LOGO.png"
          className="w-[40px] h-[40px]"
          alt="Logo"
          width={20}
          height={20}
        />
      </div>

      {!isPasswordChanged && (
        <>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              {...register("new_password")}
              className="w-full px-6 py-3.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
            {errors.new_password && (
              <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="relative w-full">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              {...register("confirm_password")}
              className="w-full px-6 py-3.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 cursor-pointer"
              onClick={() => setShowConfirm((state) => !state)}
            >
              {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
            {errors.confirm_password && (
              <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </>
      )}
      
      {/* Success Message */}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-[8px] text-green-700 text-[14px]">
          {message}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-700 text-[14px]">
          {error}
        </div>
      )}
      
      {!isPasswordChanged ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-6 py-3.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 text-white px-6 py-3.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer"
        >
          Login with new password
        </button>
      )}
      
      {!isPasswordChanged && (
        <div className="flex items-center space-x-4">
          {/* <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember your password?
          </span> */}
          <span
            className="text-[14px] text-blue-600 underline cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            Go back to login
          </span>
        </div>
      )}
    </form>
  );
}