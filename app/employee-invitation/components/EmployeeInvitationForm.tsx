"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { InfoCircle } from "iconsax-reactjs";
import Link from "next/link";

const passwordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface InvitationData {
  valid: boolean;
  name?: string;
  email?: string;
  company_name?: string;
  error?: string;
}

type PageState = "loading" | "validating" | "error" | "form" | "submitting" | "success";

interface Props {
  token: string | null;
}

export default function EmployeeInvitationForm({ token }: Props) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successEmail, setSuccessEmail] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const validateToken = useCallback(async (tokenValue: string) => {
    setPageState("validating");
    try {
      const res = await fetch("/api/employee/validate-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenValue }),
      });
      const raw: Record<string, unknown> = await res.json();
      const inner = (raw.result as Record<string, unknown>) ?? raw;
      const data: InvitationData = {
        valid: Boolean(inner.valid),
        name: String(inner.name ?? ""),
        email: String(inner.email ?? ""),
        company_name: String(inner.company_name ?? ""),
        error: String(inner.error ?? ""),
      };

      if (data.valid) {
        setInvitation(data);
        setPageState("form");
      } else {
        setErrorMessage(data.error || "Invalid invitation token");
        setPageState("error");
      }
    } catch {
      setErrorMessage("Unable to validate invitation. Please try again later.");
      setPageState("error");
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invitation token is required");
      setPageState("error");
      return;
    }
    validateToken(token);
  }, [token, validateToken]);

  const onSubmit = async (data: PasswordFormData) => {
    setPageState("submitting");
    try {
      const res = await fetch("/api/employee/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        }),
      });
      const raw: Record<string, unknown> = await res.json();
      const result = (raw.result as Record<string, unknown>) ?? raw;

      if (result.success) {
        setSuccessEmail(String(result.email ?? invitation?.email ?? ""));
        setPageState("success");
      } else {
        setErrorMessage(String(result.message || "Failed to accept invitation"));
        setPageState("form");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setPageState("form");
    }
  };

  if (pageState === "loading" || pageState === "validating") {
    return (
      <div className="w-full md:w-[480px] border p-6 rounded-[12px] shadow-sm bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">
          {pageState === "loading" ? "Loading..." : "Validating your invitation..."}
        </p>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="w-full md:w-[480px] border p-4 sm:p-6 rounded-[10px] sm:rounded-[12px] shadow-sm bg-gray-50 flex flex-col gap-6">
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-red-500 bg-red-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full animate-pulse">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="red" />
          <p className="text-red-600 text-xs sm:text-[15px] font-semibold">
            {errorMessage}
          </p>
        </div>
        <Link
          href="/auth"
          className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-xs sm:text-[15px] hover:bg-blue-600 cursor-pointer text-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="w-full md:w-[480px] border p-4 sm:p-6 rounded-[10px] sm:rounded-[12px] shadow-sm bg-gray-50 flex flex-col gap-6">
        <div className="text-gray-700 font-semibold text-sm sm:text-[16px] md:text-2xl text-center">
          Invitation Accepted
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-[8px] text-green-700 text-sm text-center">
          Invitation accepted. You can now log in with your new password.
        </div>
        {successEmail && (
          <p className="text-gray-600 text-sm text-center">
            Your account: <span className="font-medium">{successEmail}</span>
          </p>
        )}
        <Link
          href="/auth"
          className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-xs sm:text-[15px] hover:bg-blue-600 cursor-pointer text-center"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full md:w-[480px] border p-4 sm:p-6 rounded-[10px] sm:rounded-[12px] shadow-sm bg-gray-50 flex flex-col space-y-4 sm:space-y-5"
    >
      <div className="text-gray-700 font-semibold text-sm sm:text-[16px] md:text-2xl">
        Set Your Password
      </div>

      {invitation && (
        <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-3 sm:p-4">
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
            Hi{" "}
            <span className="font-semibold text-gray-900">{invitation.name}</span>,
            set your password to join{" "}
            <span className="font-semibold text-gray-900">{invitation.company_name}</span>
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="flex flex-row items-center space-x-2 sm:space-x-4 border-2 border-red-500 bg-red-50 rounded-[6px] sm:rounded-[8px] p-2 sm:p-3 w-full animate-pulse">
          <InfoCircle size="16" className="sm:w-5 sm:h-5" color="red" />
          <p className="text-red-600 text-xs sm:text-[15px] font-semibold">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="relative flex flex-col gap-1 w-full">
        <label
          htmlFor="new_password"
          className="text-gray-700 text-xs sm:text-sm font-medium"
        >
          New Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter new password"
          {...register("new_password")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400 cursor-pointer"
        >
          {showPassword ? (
            <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
        {errors.new_password && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {errors.new_password.message}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label
          htmlFor="confirm_password"
          className="text-gray-700 text-xs sm:text-sm font-medium"
        >
          Confirm Password
        </label>
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm new password"
          {...register("confirm_password")}
          className="w-full px-4 sm:px-6 py-2 sm:py-2.5 pr-10 sm:pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[6px] sm:rounded-[8px] placeholder:text-zinc-400 placeholder:text-xs sm:placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute top-8 sm:top-9.5 right-3 sm:right-5 text-zinc-400 cursor-pointer"
        >
          {showConfirm ? (
            <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
        {errors.confirm_password && (
          <p className="text-red-500 text-[10px] sm:text-[12px] absolute left-0 top-[60px] sm:top-[70px]">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pageState === "submitting"}
        className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] sm:rounded-[8px] text-xs sm:text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pageState === "submitting" ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          "Set Password"
        )}
      </button>

      <Link
        href="/auth"
        className="text-[12px] sm:text-[14px] text-blue-600 underline cursor-pointer text-center"
      >
        Go back to login
      </Link>
    </form>
  );
}
