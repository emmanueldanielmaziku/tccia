"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { MdEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useFormState, useResetFormState } from "../services/FormStates";

// Validation schema 
const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain letters")
    .regex(/[0-9]/, "Password must contain numbers"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { toggleFormType } = useFormState();
  const { resetForm } = useResetFormState();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-12 md:mt-[50px] flex flex-col space-y-7 w-full md:w-[480px] border p-6 rounded-[12px] shadow-sm bg-gray-50"
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
          Welcome back to TCCIA!
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

      <div className="relative w-full">
        <input
          type={isPasswordVisible ? "text" : "password"}
          placeholder="Enter your password"
          {...register("password")}
          className="w-full px-6 py-3.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400"
        >
          {isPasswordVisible ? (
            <MdVisibilityOff className="w-5 h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-5 h-5 cursor-pointer" />
          )}
        </button>
        {errors.password && (
          <p className="text-red-500 text-[12px] absolute left-0 top-[58px]">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-3.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer"
      >
        Login
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Don't have an account ?
        </span>
        <span
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          Create new account
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Forgot your password ?
        </span>
        <span
          className="text-[14px] text-red-600 underline cursor-pointer"
          onClick={resetForm}
        >
          Reset password
        </span>
      </div>
    </form>
  );
}
