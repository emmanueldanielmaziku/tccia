"use client";
import { useState } from "react";
import { z } from "zod";
import useFactoryVerificationState from "@/app/client/services/FactoryVerificationState";
import { User, Text, Sms, Call, DocumentUpload, Add, CloseCircle } from "iconsax-reactjs";

// Zod schema for validation
const factoryVerificationSchema = z.object({
  firstname: z
    .string()
    .min(1, "Firstname is required")
    .max(50, "Firstname is too long"),
  lastname: z
    .string()
    .min(1, "Lastname is required")
    .max(50, "Lastname is too long"),
  companyname: z.string().min(1, "Company name required"),
  regnumber: z
    .string()
    .min(1, "Registration number required")
    .max(50, "Invalid registration No."),
  email: z.string().email("Email address required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export default function FactoryVerificationForm() {
  const { isFactoryVerified, toggleVerificationForm } =
    useFactoryVerificationState();

  // State for form inputs
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    companyname: "",
    regnumber: "",
    email: "",
    phone: "",
    businessCert: "",
    taxCert: "",
  });

  // State for errors
  const [errors, setErrors] = useState<{
    firstname?: string;
    lastname?: string;
    companyname?: string;
    regnumber?: string;
    email?: string;
    phone?: string;
  }>({});

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data using Zod
    const result = factoryVerificationSchema.safeParse(formData);

    if (!result.success) {
      // Extract errors and set them in state
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstname: fieldErrors.firstname?.[0],
        lastname: fieldErrors.lastname?.[0],
        companyname: fieldErrors.companyname?.[0],
        regnumber: fieldErrors.regnumber?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
      });
      return;
    }

    // If validation passes, clear errors and proceed
    setErrors({});
    console.log("Form submitted successfully:", result.data);
  };

  return (
    <form
      className="flex flex-col space-y-4 w-full md:w-[960px] mb-24 p-6"
      onSubmit={handleSubmit}
    >
      <div className="font-semibold antialiased text-[22px]">
        Factory Verification
      </div>
      {/* Applicant Details */}
      <div className="flex flex-col gap-4">
        <div className="font-semibold antialiased text-[18px] text-zinc-600 w-full border-b-[1px] pb-4">
          Applicant Information
        </div>
        <div className="flex flex-row gap-6">
          {/* Firstname Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">First Name</div>
            <input
              type="text"
              placeholder="Enter your firstname"
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.firstname ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <User
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
            )}
          </div>

          {/* Lastname Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Second Name</div>
            <input
              type="text"
              placeholder="Enter your lastname"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.lastname ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <User
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-6">
          {/* Email Address Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Email Address</div>
            <input
              type="text"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.email ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Sms
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone number Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Phone Number</div>
            <input
              type="number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.phone ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Call
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Factory details */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="font-semibold antialiased text-[18px] text-zinc-600 w-full border-b-[1px] pb-4">
          Factory Details
        </div>
        <div className="flex flex-row gap-6">
          {/* Company Name Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Company Name</div>
            <input
              type="text"
              placeholder="Enter the company name"
              value={formData.companyname}
              onChange={(e) =>
                setFormData({ ...formData, companyname: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.companyname ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Text
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />

            {errors.companyname && (
              <p className="text-red-500 text-sm mt-1">{errors.companyname}</p>
            )}
          </div>

          {/* Company Registration Details Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Company Registration Number</div>
            <input
              type="text"
              placeholder="Enter your company registration number"
              value={formData.regnumber}
              onChange={(e) =>
                setFormData({ ...formData, regnumber: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.regnumber ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Text
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.regnumber && (
              <p className="text-red-500 text-sm mt-1">{errors.regnumber}</p>
            )}
          </div>
        </div>

        {/* File Uploader */}
        <div className="flex flex-row gap-6">
          <label className="block w-full pt-1">
            <span className="text-gray-700 text-sm font-medium">
              Business Registration Certificate
            </span>

            <div
              className="mt-2 block w-full text-sm text-gray-500
               py-3.5 px-4 
               rounded-md border-[1px]
                border-dashed
                border-gray-400
               bg-gray-100
               hover:bg-gray-200 cursor-pointer"
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const fileName =
                    e.target.files?.[0]?.name || "No file chosen";
                  setFormData({ ...formData, businessCert: fileName });
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3 text-gray-400">
                  <Add size="22" color="#9F9FA9" />
                  Upload Business Certificate
                </div>

                <div>
                  <DocumentUpload size="22" color="#9F9FA9" />
                </div>
              </div>
            </div>
            {formData.businessCert && (
              <div className="mt-2 text-sm text-gray-700 border-[0.5px] p-2 rounded-sm bg-blue-100 border-blue-400">
                <span className="mt-2 text-sm text-gray-600 p-2">
                  {formData.businessCert}
                </span>
              </div>
            )}
          </label>

          <label className="block w-full pt-1">
            <span className="text-gray-700 text-sm font-medium">
              Tax Clearance Certificate
            </span>

            <div
              className="mt-2 block w-full text-sm text-gray-500
               py-3.5 px-4 
               rounded-md border-[1px]
                border-dashed
                border-gray-400
               bg-gray-100
               hover:bg-gray-200 cursor-pointer"
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const fileName =
                    e.target.files?.[0]?.name || "No file chosen";
                  setFormData({ ...formData, taxCert: fileName });
                }}
                className="hidden"
              />
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3 text-gray-400">
                  <Add size="22" color="#9F9FA9" />
                  Upload Tax Certificate
                </div>

                <div>
                  <DocumentUpload size="22" color="#9F9FA9" />
                </div>
              </div>
            </div>

            {formData.taxCert && (
              <div className="mt-2 text-sm text-gray-700 border-[0.5px] p-2 rounded-sm bg-blue-100 border-blue-400">
                <span className="mt-2 text-sm text-gray-600 p-2">
                  {formData.taxCert}
                </span>
                <CloseCircle size="22" color="#FF8A65" />
              </div>
            )}
          </label>
        </div>
        {/* End of file uploader */}

        <div className="flex flex-row gap-6">
          {/* Firstname Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Factory Name Name</div>
            <input
              type="text"
              placeholder="Enter your firstname"
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.firstname ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Text
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
            )}
          </div>

          {/* Lastname Input */}
          <div className="relative w-full">
            <div className="text-sm py-2">Factory Address</div>
            <input
              type="text"
              placeholder="Enter your lastname"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.lastname ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <Text
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <div className="text-sm py-2">Product factory description</div>
        <textarea
          placeholder="Brief description of the product factory"
          rows={5}
          className="w-full border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px] p-6"
        ></textarea>
      </div>
      <div className="w-full flex items-center justify-end space-y-8">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-40 cursor-pointer"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
