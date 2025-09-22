"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { MdEmail } from "react-icons/md";
import { useResetFormState } from "../services/FormStates";
import { useState } from "react";
import { useApiWithSessionHandling } from "@/app/hooks/useApiWithSessionHandling";

// Validation schema 
const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const { resetForm } = useResetFormState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setMessage(null);

    try {
      const response = await fetchWithSessionHandling("/api/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || result.result?.error) {
        throw new Error(result.result?.error || "Failed to send reset email");
      }

      setMessage("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
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
          Reset your password
        </div>
        <Image
          src="/icons/LOGO.png"
          className="w-[40px] h-[40px]"
          alt="Logo"
          width={20}
          height={20}
        />
      </div>
      <div className="relative w-full">
        <input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="w-full px-6 py-3.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <MdEmail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
        {errors.email && (
          <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
            {errors.email.message}
          </p>
        )}
      </div>
      
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
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-6 py-3.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Reset Password"}
      </button>
      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Have you remembered your password ?
        </span>
        <span
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={resetForm}
        >
          Go back to login
        </span>
      </div>
    </form>
  );
}
