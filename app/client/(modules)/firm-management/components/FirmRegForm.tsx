"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TextBlock, TickCircle } from "iconsax-reactjs";
import usetinFormState from "../../../services/companytinformState";
import { retryFetch } from "@/app/utils/retryFetch";

const companySchema = z.object({
  companyTin: z.string().min(6, "Company TIN is Invalid"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type CompanyData = {
  company_tin: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  nationality_code: string;
  registration_type_code: string;
  fax_number: string;
  postal_code: string;
  postal_address: string;
  postal_detail: string;
  physical_address: string;
  description: string;
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
  onConfirm: (code: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | undefined>(undefined);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const MAX_RESEND_ATTEMPTS = 3;
  const RESEND_COOLDOWN_SECONDS = 300; // 5 minutes (OTP expiration time)

  // Browser storage keys
  const STORAGE_KEY_ATTEMPTS = `otp_attempts_${companyData?.company_tin}`;
  const STORAGE_KEY_COOLDOWN = `otp_cooldown_${companyData?.company_tin}`;
  const STORAGE_KEY_TIMESTAMP = `otp_timestamp_${companyData?.company_tin}`;

  // Load persisted data from browser storage
  useEffect(() => {
    if (companyData?.company_tin) {
      const savedAttempts = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
      const savedCooldown = localStorage.getItem(STORAGE_KEY_COOLDOWN);
      const savedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);

      if (savedAttempts) {
        setResendAttempts(parseInt(savedAttempts));
      }

      if (savedCooldown && savedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
        const remaining = parseInt(savedCooldown) - elapsed;
        
        if (remaining > 0) {
          setResendCooldown(remaining);
        } else {
          // Clear expired cooldown
          localStorage.removeItem(STORAGE_KEY_COOLDOWN);
          localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
        }
      }
    }
  }, [companyData?.company_tin, STORAGE_KEY_ATTEMPTS, STORAGE_KEY_COOLDOWN, STORAGE_KEY_TIMESTAMP]);

  // Save attempts to browser storage
  useEffect(() => {
    if (companyData?.company_tin) {
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, resendAttempts.toString());
    }
  }, [resendAttempts, companyData?.company_tin, STORAGE_KEY_ATTEMPTS]);

  // Save cooldown to browser storage
  useEffect(() => {
    if (companyData?.company_tin && resendCooldown > 0) {
      localStorage.setItem(STORAGE_KEY_COOLDOWN, resendCooldown.toString());
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
    } else if (companyData?.company_tin && resendCooldown === 0) {
      localStorage.removeItem(STORAGE_KEY_COOLDOWN);
      localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
    }
  }, [resendCooldown, companyData?.company_tin, STORAGE_KEY_COOLDOWN, STORAGE_KEY_TIMESTAMP]);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendCooldown]);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/firm-registration/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_tin: companyData?.company_tin,
        }),
      });

      const result = await response.json();

      if (result.result?.status === "success") {
        setShowOtpInput(true);
        setOtpError(undefined);
        setOtpMessage(result.result?.message);
        setResendCooldown(RESEND_COOLDOWN_SECONDS); // Start cooldown timer (5 minutes)
      } else {
        setOtpError(
          result.result?.error || result.result?.message || "Failed to send OTP"
        );
        setOtpMessage(undefined);
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
      setOtpMessage(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      setOtpError(`Maximum resend attempts (${MAX_RESEND_ATTEMPTS}) reached. Please contact support.`);
      return;
    }

    if (resendCooldown > 0) {
      const minutes = Math.ceil(resendCooldown / 60);
      const seconds = resendCooldown % 60;
      setOtpError(`Please wait ${minutes}m ${seconds}s before resending OTP.`);
      return;
    }

    setIsResending(true);
    setOtpError(undefined);
    
    try {
      const response = await fetch("/api/auth/firm-registration/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_tin: companyData?.company_tin,
        }),
      });

      const result = await response.json();

      if (result.result?.status === "success") {
        setResendAttempts(prev => prev + 1);
        setOtpMessage(result.result?.message || `OTP resent successfully. Attempts remaining: ${MAX_RESEND_ATTEMPTS - resendAttempts - 1}`);
        setOtpError(undefined);
        setResendCooldown(RESEND_COOLDOWN_SECONDS); // Start 5-minute cooldown timer after successful resend
      } else {
        setOtpError(
          result.result?.error || result.result?.message || "Failed to resend OTP"
        );
      }
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
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
      const response = await fetch("/api/auth/firm-registration/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_tin: companyData?.company_tin,
          code_input: otp,
        }),
      });

      const result = await response.json();
      const apiResult = result.result;

      if (apiResult.status === "success") {
        setShowSuccess(true);
        setOtpError(undefined);
        
        // Auto-select the newly registered company
        if (apiResult.data) {
          const newCompany = apiResult.data;
          const companySession = {
            id: newCompany.id,
            company_tin: newCompany.company_tin,
            company_name: newCompany.company_name,
            company_nationality_code: newCompany.company_nationality_code,
            company_registration_type_code: newCompany.company_registration_type_code,
            company_email: newCompany.company_email,
            company_telephone_number: newCompany.company_telephone_number,
          };
          localStorage.setItem("selectedCompany", JSON.stringify(companySession));
          window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
          window.dispatchEvent(new Event("COMPANY_REGISTERED_EVENT"));
        }
        
        setTimeout(() => {
          onConfirm(otp);
        }, 2000);
      } else if (apiResult.status === "error") {
        if (apiResult.error?.message) {
          setOtpError(apiResult.error.message);
        } else if (typeof apiResult.error === "string") {
          setOtpError(apiResult.error);
        } else {
          setOtpError("Invalid OTP. Please try again.");
        }
      } else {
        setOtpError("Unexpected response. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
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
                Please verify the company details and confirm Registration
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
              <span className="text-gray-600">{companyData.company_name || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">TIN Number:</span>
              <span className="text-gray-600">{companyData.company_tin || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">{companyData.company_email || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-600">{companyData.company_phone || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">
                Physical Address:
              </span>
              <span className="text-gray-600">
                {companyData.physical_address || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Description:</span>
              <span className="text-gray-600">{companyData.description || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">
                Nationality Code:
              </span>
              <span className="text-gray-600">
                {companyData.nationality_code || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">
                Registration Type Code:
              </span>
              <span className="text-gray-600">
                {companyData.registration_type_code || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Fax Number:</span>
              <span className="text-gray-600">{companyData.fax_number || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Code:</span>
              <span className="text-gray-600">{companyData.postal_code || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Address:</span>
              <span className="text-gray-600">
                {companyData.postal_address || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Detail:</span>
              <span className="text-gray-600">{companyData.postal_detail || "N/A"}</span>
            </div>
          </div>

          {/* Action Buttons or OTP Section */}
          {!showOtpInput && !showSuccess ? (
            <div className="flex justify-end">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Sending OTP..." : "Approve and Continue"}
              </button>
            </div>
          ) : !showSuccess ? (
            <form onSubmit={handleOtpSubmit} className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  OTP Verification
                </h3>
                {otpMessage ? (
                  <p className="text-sm text-blue-600 mb-4">{otpMessage}</p>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">
                    An OTP has been sent to {companyData.company_email}
                  </p>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      // Only allow numbers and limit to 6 digits
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtp(value);
                      setOtpError(undefined);
                    }}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className={`w-full px-4 py-2 border ${
                      otpError ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {otpError && (
                    <p className="text-red-500 text-sm mt-1">{otpError}</p>
                  )}
                </div>
                
                {/* Attempt Counter */}
                <div className="mt-4 text-sm text-gray-600">
                  {resendAttempts < MAX_RESEND_ATTEMPTS ? (
                    <span>Resend attempts remaining: {MAX_RESEND_ATTEMPTS - resendAttempts}</span>
                  ) : (
                    <span className="text-red-600">Maximum resend attempts reached</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || resendAttempts >= MAX_RESEND_ATTEMPTS || resendCooldown > 0}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    resendAttempts >= MAX_RESEND_ATTEMPTS || resendCooldown > 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-50"
                  }`}
                >
                  {isResending ? "Resending..." : resendCooldown > 0 ? `Resend OTP (${Math.ceil(resendCooldown / 60)}m ${resendCooldown % 60}s)` : "Resend OTP"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Confirm OTP"}
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

export default function FirmRegForm({
  onCompanyAdded,
}: {
  onCompanyAdded?: () => void;
}) {
  const [companyTin, setCompanyTin] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [previewState, togglePreview] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleCompanyTinForm } = usetinFormState();

  // Ensure modal is not open if no companyData
  useEffect(() => {
    if (!companyData && previewState) {
      togglePreview(false);
    }
  }, [companyData, previewState]);

  const fetchCompanyData = async (tin: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await retryFetch("/api/auth/firm-registration/submit-tin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_tin: tin,
        }),
      }, {
        maxRetries: 2,
        retryDelay: 2000,
        timeout: 10000,
        onRetry: (retryCount, maxRetries) => {
          setError(`Request timed out. Retrying... (${retryCount}/${maxRetries})`);
        },
        onTimeout: () => {
          setError("Request timed out after multiple attempts. Please check your connection and try again.");
        }
      });

      const result = await response.json();
      console.log(result);

      if (result.result?.status === "success") {
        const data = result.result.data;
        
        // Validate that essential company fields are present
        // Business TINs may return incomplete data, so we need to validate
        if (!data || !data.company_name || !data.company_tin) {
          setError(
            "Invalid TIN. Only Company TINs are allowed. Business TINs cannot be registered. Please enter a valid Company TIN."
          );
          setCompanyData(null);
          return;
        }
        
        // Additional validation for required fields
        const missingFields = [];
        if (!data.company_email) missingFields.push("email");
        if (!data.company_phone) missingFields.push("phone");
        if (!data.physical_address) missingFields.push("physical address");
        
        if (missingFields.length > 0) {
          setError(
            `Incomplete company data. Missing: ${missingFields.join(", ")}. Only valid Company TINs with complete information can be registered.`
          );
          setCompanyData(null);
          return;
        }
        
        setCompanyData(data);
        togglePreview(true);
        setError(undefined); // Clear any previous errors
      } else if (result.result?.status === "error") {
        if (result.result.error?.message) {
          setError(result.result.error.message);
        } else if (typeof result.result.error === "string") {
          setError(result.result.error);
        } else {
          setError("Failed to fetch company data");
        }
      } else {
        setError("Failed to fetch company data");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      
      if (error instanceof Error && error.message.includes("timed out")) {
        // Error message already set by onTimeout callback
      } else {
        setError("Failed to fetch company data. Please try again.");
      }
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
    toggleCompanyTinForm();
    if (onCompanyAdded) onCompanyAdded(); // Notify parent to refresh company list
    window.dispatchEvent(new Event("COMPANY_LIST_UPDATED")); // Notify other components
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
                  error ? "border-blue-500" : "border-zinc-300"
                } bg-zinc-100 outline-none rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
                disabled={isLoading}
              />
              <TextBlock
                size="22"
                color="#9F9FA9"
                className="absolute top-13 right-5"
              />
              {error && <p className="text-blue-500 text-sm mt-1">{error}</p>}
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
