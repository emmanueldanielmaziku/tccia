"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "../services/FormStates";
import { ArrowDown2, Call, PasswordCheck, Sms, User } from "iconsax-reactjs";

// Validation schema with password match
const schema = z.object({
  fullName: z.string().min(1, "Fullname is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.string().min(1, "Please select a role"),
  // password: z
  //   .string()
  //   .min(8, "Password must be at least 8 characters")
  //   .regex(/[a-zA-Z]/, "Password must contain letters")
  //   .regex(/[0-9]/, "Password must contain numbers"),
  // confirmPassword: z
  //   .string()
  //   .min(8, "Confirm password must be at least 8 characters"),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

type FormData = z.infer<typeof schema>;

export default function RegForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Choose your role");
  const [roleBox, setRoleBox] = useState(false);
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [activated, setActivated] = useState(false);

  const { formType, toggleFormType } = useFormState();

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
      className="flex flex-col space-y-3 w-full md:w-[480px] mb-20 border p-6 rounded-[15px] shadow-sm bg-gray-50"
    >
      <div className="w-full flex flex-row justify-between items-center space-x-4">
        {/* <img
          src="/icons/LOGO.png"
          className="w-[40px] h-[40px]"
          alt="Logo"
          width={20}
          height={20}
        /> */}
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          Create a new account
        </div>
        {/* <img
          src="/icons/LOGO.png"
          className="w-[40px] h-[40px]"
          alt="Logo"
          width={20}
          height={20}
        /> */}
      </div>

      {/* Error box */}
      <div className="w-full flex flex-col justify-between items-center">
        {/* fa warning icon */}

        <div className="hidden flex-row items-center space-x-4 border border-red-500 bg-red-100 rounded-[8px] p-4 w-full">
          <Call size="22" color="#9F9FA9" className="absolute top-13 right-5" />
          <p className="text-red-500 text-[15px] font-semibold">
            Sorry this email already exists
          </p>
        </div>

        {/* success box */}
        <div className="hidden flex-row items-center space-x-4 border border-green-500 bg-green-100 rounded-[8px] p-4 w-full">
          <Call size="22" color="#9F9FA9" className="absolute top-13 right-5" />
          <p className="text-green-500 text-[15px] font-semibold">
            Your account has been created successfully
          </p>
        </div>
      </div>

      <div className="md:flex md:flex-row md:gap-5 flex-col space-y-5 md:space-y-1 hidden">
        <div className="relative flex flex-col gap-1 w-full">
          <span className="text-gray-700 text-sm font-medium">First name</span>
          <input
            type="text"
            placeholder="First name"
            {...register("firstName")}
            className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          />
          <User
            size="20"
            color="#9F9FA9"
            className="absolute top-9.5 right-5"
          />
          {errors.firstName && (
            <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="relative flex flex-col gap-1 w-full">
          <span className="text-gray-700 text-sm font-medium">Last name</span>
          <input
            type="text"
            placeholder="Last name"
            {...register("lastName")}
            className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
          />
          <User
            size="20"
            color="#9F9FA9"
            className="absolute top-9.5 right-5"
          />
          {errors.lastName && (
            <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>
      <div className="relative w-full md:hidden">
        <input
          type="text"
          placeholder="Enter your fullname"
          {...register("fullName")}
          className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <User size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />
        {errors.fullName && (
          <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
            {errors.fullName.message}
          </p>
        )}
      </div>
      <div className="relative flex flex-col gap-1 w-full">
        <span className="text-gray-700 text-sm font-medium">
          Business email
        </span>
        <input
          type="email"
          placeholder="Enter your email address"
          {...register("email")}
          className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <Sms size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />

        {errors.email && (
          <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <span className="text-gray-700 text-sm font-medium">Phone number</span>
        <input
          type="tel"
          placeholder="Enter your phone number"
          {...register("role")}
          className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <Call size="20" color="#9F9FA9" className="absolute top-9.5 right-5" />
        {errors.phone && (
          <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="relative flex flex-col gap-1 w-full">
        <span className="text-gray-700 text-sm font-medium">
          Please select your role
        </span>
        {roleBox && (
          <div className="text-sm text-gray-600 font-semibold bg-white shadow-sm p-1.5 rounded-[10px] flex flex-col gap-1.5 absolute w-full border-[0.5px] px-1.5 z-10 top-18">
            <div
              className="border-zinc-200 pb-4 pt-3.5 border-[0.5px] hover:text-blue-500 hover:bg-gray-50 cursor-pointer rounded-[7px] bg-gray-100 px-3.5"
              onClick={() => {
                setRoleBox(false);
                setRole("Register as Exporter manager");
              }}
            >
              Register as Exporter manager
            </div>
            <div
              className="border-zinc-200 pb-4 pt-3.5 border-[0.5px] hover:text-blue-500 hover:bg-gray-50 cursor-pointer rounded-[7px] bg-gray-100 px-3.5"
              onClick={() => {
                setRoleBox(false);
                setRole("Register as CFA Manager");
              }}
            >
              Register as CFA manager
            </div>
          </div>
        )}
        <div
          onClick={() => setRoleBox(true)}
          {...register("role")}
          className={`w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 cursor-pointer hover:bg-zinc-200 text-sm ${ role === "Register as Exporter manager" ? "text-black text-[15.5px]" : role === "Register as CFA Manager" ? "text-black text-[15.5px]" : "text-gray-400"}`}
        >
          {role}
        </div>
        <ArrowDown2
          size="20"
          color="#9F9FA9"
          className="absolute top-9.5 right-5"
        />
        {errors.phone && (
          <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
            {errors.phone.message}
          </p>
        )}
      </div>

      {role !== "Choose your role" ? (
        role === "Register as Exporter manager" ? (
          <div className="relative flex flex-col gap-1 w-full">
            <span className="text-gray-700 text-sm font-medium">
              TIN - Number
            </span>
            <input
              type="number"
              placeholder="Enter your TIN number"
              {...register("phone")}
              className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            />
            <PasswordCheck
              size="20"
              color="#9F9FA9"
              className="absolute top-9.5 right-5"
            />
            {errors.phone && (
              <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
                {errors.phone.message}
              </p>
            )}
          </div>
        ) : (
          <div className="relative flex flex-col gap-1 w-full">
            <span className="text-gray-700 text-sm font-medium">
              TAFFA ID - Number
            </span>
            <input
              type="number"
              placeholder="Enter your TAFFA ID number"
              {...register("phone")}
              className="w-full px-5 py-3 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
            />
            <PasswordCheck
              size="20"
              color="#9F9FA9"
              className="absolute top-9.5 right-5"
            />
            {errors.phone && (
              <p className="text-red-500 text-[11px] absolute left-0 top-[75px] w-full text-right">
                {errors.phone.message}
              </p>
            )}
          </div>
        )
      ) : null}
      {/* <div className="relative w-full">
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
          <p className="text-red-500 text-[11px] absolute left-0 top-[55px]">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="relative w-full">
        <input
          type={isConfirmPasswordVisible ? "text" : "password"}
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          className="w-full px-6 py-3.5 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 placeholder:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          aria-label={
            isConfirmPasswordVisible
              ? "Hide confirm password"
              : "Show confirm password"
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400"
        >
          {isConfirmPasswordVisible ? (
            <MdVisibilityOff className="w-5 h-5 cursor-pointer" />
          ) : (
            <MdVisibility className="w-5 h-5 cursor-pointer" />
          )}
        </button>
        {errors.confirmPassword && (
          <p className="text-red-500 text-[11px] absolute left-0 top-[55px]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div> */}

      <button
        type="submit"
        className="bg-blue-500 h-[50px] text-white px-6 py-3.5 rounded-[8px] text-[15px] hover:bg-blue-600 cursor-pointer flex items-center justify-center space-x-2 mt-2"
      >
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="hidden">Create account</div>
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-[14px] text-gray-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Do you have an account already?
        </span>
        <span
          className="text-[14px] text-blue-600 underline cursor-pointer"
          onClick={toggleFormType}
        >
          Login
        </span>
      </div>
    </form>
  );
}
