"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "../services/FormStates";
import { useTranslations } from "next-intl";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useRouter } from "next/navigation";
import { ArrowDown2, Call, Sms, User } from "iconsax-reactjs";

const Roles = {
  CEM: {
    display: "Company Export Manager",
    value: "manager",
  },
  CFAM: {
    display: "Trader",
    value: "cfa",
  },
} as const;

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
  const t = useTranslations();
  const tf = useTranslations("forms");

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
      role: "trader",
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
      // Find the role key based on the display value
      const roleKey = Object.entries(Roles).find(
        ([_, role]) => role.display === data.role
      )?.[0];
      const roleValue = roleKey
        ? Roles[roleKey as keyof typeof Roles].value
        : data.role;

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
          role: roleValue,
        }),
      });

      console.log("API Response status:", response.status);
      const result = await response.json();
      console.log("API Response:", result);

      if (result.result?.error) {
        throw new Error(result.result.error);
      }

      if (result.result?.success) {
        // Store registration data in localStorage or state management if needed
        localStorage.setItem(
          "registration_id",
          result.result.registration_id.toString()
        );
        localStorage.setItem("user_id", result.result.user_id.toString());
        localStorage.setItem("user_name", result.result.name);
        localStorage.setItem("user_role", result.result.role);
        localStorage.setItem("user_email", result.result.email);
        localStorage.setItem("registration_state", result.result.state);

        setSuccess(tf("messages.registrationSuccess"));
        reset();
        setTimeout(() => {
          toggleFormType();
        }, 2000);
      } else {
        throw new Error(tf("messages.registrationFailed"));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : tf("messages.registrationFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    setError(tf("messages.checkRequiredFields"));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col space-y-3 w-full md:w-[480px] mb-20 border p-6 rounded-[15px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          {t("common.createAccount")}
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
            {tf("labels.firstName")}
          </label>
          <input
            id="firstName"
            type="text"
            placeholder={tf("placeholders.firstName")}
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
              {tf("validation.firstNameRequired")}
            </p>
          )}
        </div>
        <div className="relative flex flex-col gap-1 w-full">
          <label
            htmlFor="lastName"
            className="text-gray-700 text-sm font-medium"
          >
            {tf("labels.lastName")}
          </label>
          <input
            id="lastName"
            type="text"
            placeholder={tf("placeholders.lastName")}
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
              {tf("validation.lastNameRequired")}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="email" className="text-gray-700 text-sm font-medium">
          {t("common.email")}
        </label>
        <input
          id="email"
          type="email"
          placeholder={tf("placeholders.enterEmail")}
          {...register("email")}
          className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          autoComplete="email"
        />
        <Sms size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />

        {errors.email && (
          <p className="text-red-500 text-[11px]">
            {tf("validation.invalidEmail")}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="phone" className="text-gray-700 text-sm font-medium">
          {tf("labels.phoneNumber")}
        </label>
        <input
          id="phone"
          type="tel"
          placeholder={tf("placeholders.enterPhone")}
          {...register("phone")}
          className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          autoComplete="tel"
        />
        <Call size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />
        {errors.phone && (
          <p className="text-red-500 text-[11px]">
            {errors.phone.type === "min"
              ? tf("validation.phoneMinLength")
              : tf("validation.phoneDigitsOnly")}
          </p>
        )}
      </div>

      <div className="relative gap-1 w-full hidden">
        <label htmlFor="role" className="text-gray-700 text-sm font-medium">
          {tf("labels.role")}
        </label>
        <div
          ref={roleRef}
          className="relative w-full"
          onClick={() => setRoleBox(!roleBox)}
        >
          <input
            id="role"
            type="text"
            placeholder={tf("placeholders.selectRole")}
            value={selectedRole}
            readOnly
            className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px] cursor-pointer"
          />
          <ArrowDown2
            size="20"
            color="#9F9FA9"
            className="absolute top-3.5 right-5"
          />
          {roleBox && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg">
              {Object.entries(Roles).map(([key, role]) => (
                <div
                  key={key}
                  className="px-5 py-2.5 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setValue("role", role.display);
                    setRoleBox(false);
                  }}
                >
                  {role.display}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.role && (
          <p className="text-red-500 text-[11px]">
            {tf("validation.roleRequired")}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <label htmlFor="password" className="text-gray-700 text-sm font-medium">
          {t("common.password")}
        </label>
        <input
          id="password"
          type={isPasswordVisible ? "text" : "password"}
          placeholder={tf("placeholders.enterPassword")}
          {...register("password")}
          className="w-full px-5 py-2.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          autoComplete="new-password"
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
          <p className="text-red-500 text-[11px]">
            {errors.password.type === "min"
              ? tf("validation.passwordMinLength")
              : errors.password.type === "regex"
              ? tf("validation.passwordComplexity")
              : tf("validation.passwordRequired")}
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
          tf("buttons.register")
        )}
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {tf("messages.haveAccount")}
        </span>
        <button
          type="button"
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          {t("common.login")}
        </button>
      </div>
    </form>
  );
};

export default RegForm;
