"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "../services/FormStates";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useRouter } from "next/navigation";
import { ArrowDown2, Call, Sms, User } from "iconsax-reactjs";

const Roles = {
  CEM: "CEM",
  CFAM: "CFAM",
} as const;
type Role = keyof typeof Roles;

// Enhanced validation schema
const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  role: z.string().min(1, "Please select a role"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

type FormData = z.infer<typeof schema>;

const RegForm = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roleBox, setRoleBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  const { toggleFormType } = useFormState();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "",
    },
    mode: "onChange",
  });

  const selectedRole = watch("role");

  // Debug form state
  useEffect(() => {
    console.log("Form errors:", errors);
    console.log("Form is valid:", isValid);
    console.log("Current form values:", watch());
  }, [errors, isValid, watch]);

  // Handle clicks outside role dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Form submission started", data);
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Making API request...");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
        }),
      });

      console.log("API Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      reset(); // Reset form after successful submission

      // Redirect to login after 2 seconds
      setTimeout(() => {
        toggleFormType(); // Switch to login form
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    setError("Please check all required fields and try again.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col space-y-3 w-full md:w-[480px] mb-20 border p-6 rounded-[15px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          Create a new account
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="flex flex-row items-center space-x-4 border border-red-500 bg-red-100 rounded-[8px] p-4 w-full">
          <Call size="22" color="#9F9FA9" className="absolute top-13 right-5" />
          <p className="text-red-500 text-[15px] font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex flex-row items-center space-x-4 border border-green-500 bg-green-100 rounded-[8px] p-4 w-full">
          <Call size="22" color="#9F9FA9" className="absolute top-13 right-5" />
          <p className="text-green-500 text-[15px] font-semibold">{success}</p>
        </div>
      )}

      <div className="md:flex md:flex-row md:gap-5 flex-col space-y-5 md:space-y-1 hidden">
        <div className="relative flex flex-col gap-1 w-full">
          <label
            htmlFor="firstName"
            className="text-gray-700 text-sm font-medium"
          >
            First name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="First name"
            {...register("firstName")}
            className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            autoComplete="given-name"
          />
          <User
            size="20"
            color="#9F9FA9"
            className="absolute top-9.5 right-5"
          />
          {errors.firstName && (
            <p className="text-red-500 text-[11px]">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="relative flex flex-col gap-1 w-full">
          <label
            htmlFor="lastName"
            className="text-gray-700 text-sm font-medium"
          >
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Last name"
            {...register("lastName")}
            className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            autoComplete="family-name"
          />
          <User
            size="20"
            color="#9F9FA9"
            className="absolute top-9.5 right-5"
          />
          {errors.lastName && (
            <p className="text-red-500 text-[11px]">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="email" className="text-gray-700 text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email address"
          {...register("email")}
          className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          autoComplete="email"
        />
        <Sms size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />

        {errors.email && (
          <p className="text-red-500 text-[11px]">{errors.email.message}</p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="phone" className="text-gray-700 text-sm font-medium">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          {...register("phone")}
          className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          autoComplete="tel"
        />
        <Call size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />
        {errors.phone && (
          <p className="text-red-500 text-[11px]">{errors.phone.message}</p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full" ref={roleRef}>
        <label htmlFor="role" className="text-gray-700 text-sm font-medium">
          Please select your role
        </label>
        {roleBox && (
          <div
            className="text-sm text-gray-600 font-semibold bg-white shadow-sm p-1.5 rounded-[10px] flex flex-col gap-1.5 absolute w-full border-[0.5px] px-1.5 z-10 top-18"
            role="listbox"
          >
            <button
              type="button"
              className="border-zinc-200 pb-4 pt-3.5 border-[0.5px] hover:text-blue-500 hover:bg-gray-50 cursor-pointer rounded-[7px] bg-gray-100 px-3.5 text-left"
              onClick={() => {
                setRoleBox(false);
                setValue("role", Roles.CEM);
              }}
              role="option"
            >
              Register as Exporter manager
            </button>
            <button
              type="button"
              className="border-zinc-200 pb-4 pt-3.5 border-[0.5px] hover:text-blue-500 hover:bg-gray-50 cursor-pointer rounded-[7px] bg-gray-100 px-3.5 text-left"
              onClick={() => {
                setRoleBox(false);
                setValue("role", Roles.CFAM);
              }}
              role="option"
            >
              Register as CFA manager
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setRoleBox(!roleBox)}
          className={`w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 cursor-pointer hover:bg-zinc-200 text-sm text-left ${
            selectedRole ? "text-black text-[15.5px]" : "text-gray-400"
          }`}
          aria-expanded={roleBox}
          aria-haspopup="listbox"
          aria-labelledby="role-label"
          id="role"
        >
          {selectedRole === Roles.CEM
            ? "Register as Exporter manager"
            : selectedRole === Roles.CFAM
            ? "Register as CFA manager"
            : "Choose your role"}
        </button>
        <ArrowDown2
          size="20"
          color="#9F9FA9"
          className="absolute top-9.5 right-5"
        />
        {errors.role && (
          <p className="text-red-500 text-[11px]">{errors.role.message}</p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="password" className="text-gray-700 text-sm font-medium">
          Password
        </label>
        <div className="relative w-full">
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className="w-full px-6 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            autoComplete="new-password"
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
            <p className="text-red-500 text-[11px]">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedRole}
        onClick={() => {
          console.log("Submit button clicked");
          console.log("Current form state:", {
            errors,
            isValid,
            values: watch(),
          });
        }}
        className="bg-blue-500 h-[45px] text-white px-6 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : selectedRole === Roles.CEM ? (
          "Register as Exporter Manager"
        ) : selectedRole === Roles.CFAM ? (
          "Register as CFA Manager"
        ) : (
          "Create Account"
        )}
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Do you have an account already?
        </span>
        <button
          type="button"
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default RegForm;
