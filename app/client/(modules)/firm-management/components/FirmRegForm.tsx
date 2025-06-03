"use client";
import { useState } from "react";
import { z } from "zod";
import { TextBlock, TickCircle } from "iconsax-reactjs";

// Zod schema for validation
const companySchema = z.object({
  companyTin: z.string().min(6, "Company TIN is Invalid"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Mock company data type
type CompanyData = {
  company_tin: string;
  company_nationality_code: string;
  company_registration_type_code: string;
  company_name: string;
  company_telephone_number: string;
  company_fax_number: boolean;
  company_postal_code: string;
  company_postal_base_address: string;
  company_postal_detail_address: string;
  company_physical_address: string;
  company_email: string;
  company_description: string;
};

function PreviewWidget({
  open,
  onClose,
  companyData,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  companyData: CompanyData | null;
  onConfirm: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = otpSchema.safeParse({ otp });

    if (!result.success) {
      setOtpError(result.error.errors[0]?.message);
      return;
    }

    if (otp === "123456") {
      setShowSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  if (!companyData) return null;

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[3px] transition-opacity duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-4xl flex flex-col bg-white rounded-xl shadow-2xl p-8 animate-fadeIn">
        <div>
          <div className="flex flex-row justify-between items-center border-b border-gray-300 pb-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-1">
                Company Registration Preview
              </h2>
              <p className="text-sm text-gray-500">
                Please verify the company details and confirm registration
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-red-600 flex flex-row justify-center items-center gap-2 text-sm text-red-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px] border-red-600 transition-colors"
              aria-label="Close preview"
            >
              Reject
            </button>
          </div>

          {/* Company Info */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Company Name:</span>
              <span className="text-gray-600">{companyData.company_name}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">TIN Number:</span>
              <span className="text-gray-600">{companyData.company_tin}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">{companyData.company_email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-600">
                {companyData.company_telephone_number}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">
                Physical Address:
              </span>
              <span className="text-gray-600">
                {companyData.company_physical_address}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Description:</span>
              <span className="text-gray-600">
                {companyData.company_description}
              </span>
            </div>
          </div>

          {/* OTP Section */}
          {!showSuccess ? (
            <form onSubmit={handleOtpSubmit} className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  OTP Verification
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  An OTP has been sent to number ending{" "}
                  {companyData.company_telephone_number.slice(-3)}
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setOtpError(undefined);
                    }}
                    placeholder="Enter 6-digit OTP"
                    className={`w-full px-4 py-2 border ${
                      otpError ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {otpError && (
                    <p className="text-red-500 text-sm mt-1">{otpError}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Submit OTP
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <TickCircle size={48} color="#22C55E" variant="Bold" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">
                Registration Successful!
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                The company has been registered successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FirmRegForm() {
  const [companyTin, setCompanyTin] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [previewState, togglePreview] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock fetch company data
  const fetchCompanyData = async (tin: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response
    const mockData: CompanyData = {
      company_tin: tin,
      company_nationality_code: "TZ",
      company_registration_type_code: "IM",
      company_name: "GEJJ LIMITED",
      company_telephone_number: "+255222860814",
      company_fax_number: false,
      company_postal_code: "110101",
      company_postal_base_address: "Ubungo, Goba, Dar es Salaam",
      company_postal_detail_address: "Kinzudi",
      company_physical_address: "SAMORA AVENUE 1036/1037 BLOCK 102",
      company_email: "feysalkhan@bakhresa.com",
      company_description: "General trading and import of goods",
    };

    setCompanyData(mockData);
    setIsLoading(false);
    return mockData;
  };

  // Handle form submission (for preview)
  const handlePreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate form data using Zod
    const result = companySchema.safeParse({ companyTin });

    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }

    setError(undefined);
    await fetchCompanyData(companyTin);
    togglePreview(true);
  };

  // Handle input change
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
      {/* Preview Widget */}
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        companyData={companyData}
        onConfirm={handleConfirm}
      />
      {/* End of Preview Widget */}
      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto">
          <div className="flex flex-row gap-6 relative border-t-[0.5px] border-dashed border-gray-400 pt-8">
            {/* Company TIN Input */}
            <div className="relative w-full">
              <div className="text-sm py-2 w-full">Company TIN</div>
              <input
                type="number"
                placeholder="Enter company TIN... (xxx-xxx-xxx)"
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
