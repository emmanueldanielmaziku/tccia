"use client";
import { useState } from "react";
import { z } from "zod";
import { TextBlock, TickCircle } from "iconsax-reactjs";
import {
  CompanyData,
  MembershipResponse,
  VerificationResponse,
} from "@/app/types/membership";

// Zod schema for validation
const companySchema = z.object({
  companyTin: z.string().min(6, "Company TIN is Invalid"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

function PreviewWidget({
  open,
  onClose,
  companyData,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  companyData: CompanyData | null;
  onConfirm: (code: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/membership/send_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: companyData?.application_id,
        }),
      });

      const result = await response.json();

      if (result.result?.success) {
        setShowOtpInput(true);
      } else {
        setOtpError(result.result?.error || "Failed to send OTP");
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = otpSchema.safeParse({ otp });

    if (!result.success) {
      setOtpError(result.error.errors[0]?.message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/membership/verify_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: companyData?.application_id,
          code_input: otp,
        }),
      });

      const result = await response.json();

      if (result.result?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onConfirm(otp);
        }, 2000);
      } else {
        setOtpError(result.result?.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !companyData) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Company Details</h2>

        <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">Company Name:</span>
            <span className="text-gray-600">{companyData.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">TIN Number:</span>
            <span className="text-gray-600">{companyData.tin}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">Email:</span>
            <span className="text-gray-600">{companyData.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">Phone:</span>
            <span className="text-gray-600">{companyData.mobile}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">Address:</span>
            <span className="text-gray-600">{companyData.street}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-700">Postal Address:</span>
            <span className="text-gray-600">{companyData.postal_address}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Directors</h3>
          <div className="space-y-2">
            {companyData.director_line_ids.map((director, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{director.name}</p>
                <p className="text-sm text-gray-600">{director.nationality}</p>
                <p className="text-sm text-gray-600">{director.contact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Contact Persons</h3>
          <div className="space-y-2">
            {companyData.contact_person_line_ids.map((contact, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.nationality}</p>
                <p className="text-sm text-gray-600">{contact.contact}</p>
              </div>
            ))}
          </div>
        </div>

        {showSuccess ? (
          <div className="flex items-center justify-center text-green-600">
            <TickCircle size={24} className="mr-2" />
            <span>Verification successful!</span>
          </div>
        ) : showOtpInput ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Approve & Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MembershipForm() {
  const [companyTin, setCompanyTin] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [previewState, togglePreview] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanyData = async (tin: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/membership/submit_tin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tin: tin,
        }),
      });

      const result: MembershipResponse = await response.json();

      if (result.result?.data) {
        setCompanyData(result.result.data);
        togglePreview(true);
      } else {
        setError(result.result?.message || "Failed to fetch company data");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      setError("Failed to fetch company data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const result = companySchema.safeParse({ companyTin });

    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }

    setError(undefined);
    await fetchCompanyData(companyTin);
  };

  const handleInputChange = (value: string) => {
    setCompanyTin(value);
    setError(undefined);
  };

  const handleConfirm = () => {
    togglePreview(false);
    setCompanyTin("");
    setCompanyData(null);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        companyData={companyData}
        onConfirm={handleConfirm}
      />
      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto">
          <div className="flex flex-row gap-6 relative border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <div className="relative w-full">
              <div className="text-sm py-2 w-full">Company TIN</div>
              <input
                type="text"
                placeholder="Enter company TIN... (xxxxx-xxxx)"
                value={companyTin}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full px-6 py-3.5 pr-12 border ${
                  error ? "border-red-500" : "border-zinc-300"
                } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
                disabled={isLoading}
              />
              <TextBlock
                size="22"
                color="#9F9FA9"
                className="absolute top-13 right-5"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-end mt-10">
          <button
            type="submit"
            className="px-12 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit Tin Number"}
          </button>
        </div>
      </form>
    </div>
  );
}
