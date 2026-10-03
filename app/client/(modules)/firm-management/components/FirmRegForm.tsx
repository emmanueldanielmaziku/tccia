"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { TextBlock, TickCircle, TickCircle as Check } from "iconsax-reactjs";
import usetinFormState from "../../../services/companytinformState";
import { retryFetch } from "@/app/utils/retryFetch";

const companySchema = z.object({
  companyTin: z.string().min(6, "Company TIN is Invalid"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nonTinSchema = z
  .object({
    company_name: z.string().trim().min(2, "Company name is required"),
    company_email: z
      .string()
      .trim()
      .refine((v) => v === "" || EMAIL_REGEX.test(v), "Enter a valid company email")
      .optional()
      .default(""),
    company_phone: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || v.length >= 9,
        "Enter a valid phone number (e.g. +255712345678)",
      )
      .optional()
      .default(""),
    physical_address: z.string().trim().min(3, "Physical address is required"),
    company_nationality_code: z
      .string()
      .trim()
      .min(2, "Company nationality is required"),
    company_registration_type_code: z.string().trim().optional().default(""),
    fax_number: z.string().trim().optional().default(""),
    postal_code: z.string().trim().optional().default(""),
    postal_address: z.string().trim().optional().default(""),
    postal_detail: z.string().trim().optional().default(""),
    description: z.string().trim().optional().default(""),
  })
  .superRefine((data, ctx) => {
    // Backend rule: at least one of company_email or company_phone is required.
    if (!data.company_email?.trim() && !data.company_phone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company_email"],
        message: "Provide at least a company email or a phone number",
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company_phone"],
        message: "Provide at least a company email or a phone number",
      });
    }
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

/** Payload captured for companies that have no TIN (non-TIN registration). */
export type NonTinCompanyData = z.infer<typeof nonTinSchema>;

const EMPTY_NON_TIN_COMPANY: NonTinCompanyData = {
  company_name: "",
  company_email: "",
  company_phone: "",
  physical_address: "",
  company_nationality_code: "TZ",
  company_registration_type_code: "",
  fax_number: "",
  postal_code: "",
  postal_address: "",
  postal_detail: "",
  description: "",
};

/** Normalize a non-TIN payload into the shape expected by the preview modal. */
function mapNonTinToCompanyData(data: NonTinCompanyData): CompanyData {
  return {
    company_tin: "",
    company_name: data.company_name,
    company_email: data.company_email,
    company_phone: data.company_phone,
    nationality_code: data.company_nationality_code,
    registration_type_code: data.company_registration_type_code ?? "",
    fax_number: data.fax_number ?? "",
    postal_code: data.postal_code ?? "",
    postal_address: data.postal_address ?? "",
    postal_detail: data.postal_detail ?? "",
    physical_address: data.physical_address,
    description: data.description ?? "",
  };
}

/** JSON-RPC shape from `/api/auth/firm-registration/send-code` */
type SendCodeResponse = {
  result?: {
    status?: string;
    data?: { verification_code?: string };
    message?: string;
    error?: string;
  };
};

/**
 * Refresh client-side access/session caches after successful company registration.
 * This helps sidebar/company picker react immediately without full re-login.
 */
async function refreshAccessAfterCompanyRegistration() {
  try {
    const response = await fetch("/api/user_token_details");

    if (response.ok) {
      const data = await response.json();

      // Update companies in localStorage
      if (data.companies && Array.isArray(data.companies)) {
        localStorage.setItem("userCompanies", JSON.stringify(data.companies));
      }

      // Update modules in localStorage
      if (data.modules && Array.isArray(data.modules)) {
        localStorage.setItem("userModules", JSON.stringify(data.modules));
      }

      // Update other user details if needed
      if (data.name) {
        localStorage.setItem("userName", data.name);
      }
      if (data.user_role) {
        localStorage.setItem("userRole", data.user_role);
      }
      if (data.user_type) {
        localStorage.setItem("userType", data.user_type);
      }
    }

    // Re-run permission/membership guards that subscribe to login refresh.
    window.dispatchEvent(new Event("USER_LOGIN_EVENT"));
  } catch {
    // Non-blocking refresh; registration success flow should continue.
  }
}

function PreviewWidget({
  open,
  onClose,
  companyData,
  onConfirm,
  isNonTin = false,
}: {
  open: boolean;
  onClose: () => void;
  companyData: CompanyData | null;
  onConfirm: (code: string) => void;
  isNonTin?: boolean;
}) {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationReference, setRegistrationReference] = useState<string>("");
  const [otpMessage, setOtpMessage] = useState<string | undefined>(undefined);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const MAX_RESEND_ATTEMPTS = 3;
  const RESEND_COOLDOWN_SECONDS = 300; // 5 minutes (OTP expiration time)

  const prevOpenRef = useRef(false);

  // When the preview opens again, start from company details (not stuck on OTP step).
  // PreviewWidget stays mounted while hidden; showOtpInput would otherwise persist.
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setOtp("");
      setOtpError(undefined);
      setShowOtpInput(false);
      setShowSuccess(false);
      setOtpMessage(undefined);
      setIsResending(false);
      setRegistrationReference("");
    }
    prevOpenRef.current = open;
  }, [open]);

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
        const elapsed = Math.floor(
          (Date.now() - parseInt(savedTimestamp)) / 1000,
        );
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
  }, [
    companyData?.company_tin,
    STORAGE_KEY_ATTEMPTS,
    STORAGE_KEY_COOLDOWN,
    STORAGE_KEY_TIMESTAMP,
  ]);

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
  }, [
    resendCooldown,
    companyData?.company_tin,
    STORAGE_KEY_COOLDOWN,
    STORAGE_KEY_TIMESTAMP,
  ]);

  // Handle cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
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

    // No-TIN flow: register the company, which creates a pending registration
    // and dispatches the OTP via email and/or SMS. No TIN is involved.
    if (isNonTin) {
      try {
        const payload = {
          company_name: companyData?.company_name,
          company_email: companyData?.company_email,
          company_phone: companyData?.company_phone,
          physical_address: companyData?.physical_address,
          company_nationality_code: companyData?.nationality_code,
          company_registration_type_code:
            companyData?.registration_type_code,
          fax_number: companyData?.fax_number,
          postal_code: companyData?.postal_code,
          postal_address: companyData?.postal_address,
          postal_detail: companyData?.postal_detail,
          description: companyData?.description,
        };

        const response = await fetch(
          "/api/auth/firm-registration/no-tin/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const result = await response.json();
        const registrationReference =
          result?.registration_reference ||
          result?.result?.registration_reference ||
          result?.result?.data?.registration_reference;

        if (registrationReference) {
          setRegistrationReference(registrationReference);
          setShowOtpInput(true);
          setOtpError(undefined);
          setOtpMessage(
            `A verification code has been sent to ${
              [
                result?.sent_to_email || result?.result?.sent_to_email
                  ? companyData?.company_email
                  : null,
                result?.sent_to_phone || result?.result?.sent_to_phone
                  ? companyData?.company_phone
                  : null,
              ]
                .filter(Boolean)
                .join(" and ") || "your contact details"
            }.`,
          );
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } else {
          setOtpError(
            result?.result?.error?.message ||
              (typeof result?.result?.error === "string"
                ? result.result.error
                : undefined) ||
              result?.message ||
              result?.result?.message ||
              "Failed to register company. Please try again.",
          );
          setOtpMessage(undefined);
        }
      } catch (error) {
        setOtpError("Failed to register company. Please try again.");
        setOtpMessage(undefined);
      } finally {
        setIsLoading(false);
      }
      return;
    }

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

      const result = (await response.json()) as SendCodeResponse;

      if (result.result?.status === "success") {
        setShowOtpInput(true);
        setOtpError(undefined);
        setOtpMessage(result.result?.message);
        setResendCooldown(RESEND_COOLDOWN_SECONDS); // Start cooldown timer (5 minutes)
      } else {
        setOtpError(
          result.result?.error ||
            result.result?.message ||
            "Failed to send OTP",
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
      setOtpError(
        `Maximum resend attempts (${MAX_RESEND_ATTEMPTS}) reached. Please contact support.`,
      );
      return;
    }

    if (resendCooldown > 0) {
      const minutes = Math.floor(resendCooldown / 60);
      const seconds = (resendCooldown % 60).toString().padStart(2, "0");
      setOtpError(`Please wait ${minutes}m ${seconds}s before resending OTP.`);
      return;
    }

    setIsResending(true);
    setOtpError(undefined);

    try {
      const response = await fetch(
        isNonTin
          ? "/api/auth/firm-registration/no-tin/resend-code"
          : "/api/auth/firm-registration/send-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isNonTin
              ? { registration_reference: registrationReference }
              : { company_tin: companyData?.company_tin },
          ),
        },
      );

      const result = await response.json();

      // The no-TIN resend endpoint returns a flat payload rather than the
      // JSON-RPC `result` wrapper used by the TIN flow.
      const isSuccess = isNonTin
        ? !!result?.registration_reference || result?.result?.status === "success"
        : result.result?.status === "success";

      if (isSuccess) {
        setResendAttempts((prev) => prev + 1);
        setOtpMessage(
          result.result?.message ||
            `OTP resent successfully. Attempts remaining: ${MAX_RESEND_ATTEMPTS - resendAttempts - 1}`,
        );
        setOtpError(undefined);
        setResendCooldown(RESEND_COOLDOWN_SECONDS); // Start 5-minute cooldown timer after successful resend
      } else {
        setOtpError(
          result?.result?.error?.message ||
            (typeof result?.result?.error === "string"
              ? result.result.error
              : undefined) ||
            result?.message ||
            result.result?.error ||
            result?.result?.message ||
            "Failed to resend OTP",
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
      const response = await fetch(
        isNonTin
          ? "/api/auth/firm-registration/no-tin/verify-code"
          : "/api/auth/firm-registration/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isNonTin
              ? { registration_reference: registrationReference, code_input: otp }
              : { company_tin: companyData?.company_tin, code_input: otp },
          ),
        },
      );

      const result = await response.json();

      // No-TIN verify returns { registration_reference, status, has_tin }.
      if (isNonTin) {
        const status = result?.status ?? result?.result?.status;

        if (status === "approved" || status === "success") {
          setShowSuccess(true);
          setOtpError(undefined);

          // Record that the active company has no TIN so the sidebar can apply
          // the No-TIN module restrictions once the list refreshes.
          try {
            const hasTin =
              (result?.has_tin ?? result?.result?.has_tin) === true;
            const existing = localStorage.getItem("selectedCompany");
            const parsed = existing ? JSON.parse(existing) : null;
            const selected = {
              id: parsed?.id,
              company_tin: "",
              company_name:
                parsed?.company_name ?? companyData?.company_name ?? "",
              company_nationality_code:
                parsed?.company_nationality_code ??
                companyData?.nationality_code ??
                "",
              company_registration_type_code:
                parsed?.company_registration_type_code ?? "",
              company_email:
                parsed?.company_email ?? companyData?.company_email ?? "",
              company_telephone_number:
                parsed?.company_telephone_number ??
                companyData?.company_phone ??
                "",
              has_tin: hasTin,
            };
            localStorage.setItem("selectedCompany", JSON.stringify(selected));
            window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
          } catch {
            // Non-blocking: access refresh below will still run.
          }

          await refreshAccessAfterCompanyRegistration();
          window.dispatchEvent(new Event("COMPANY_LIST_UPDATED"));
          setTimeout(() => {
            onConfirm(otp);
          }, 2000);
        } else {
          setOtpError(
            result?.error?.message ||
              (typeof result?.error === "string" ? result.error : undefined) ||
              result?.result?.error?.message ||
              (typeof result?.result?.error === "string"
                ? result.result.error
                : undefined) ||
              result?.message ||
              "Invalid OTP. Please try again.",
          );
        }
        return;
      }

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
            company_registration_type_code:
              newCompany.company_registration_type_code,
            company_email: newCompany.company_email,
            company_telephone_number: newCompany.company_telephone_number,
          };
          localStorage.setItem(
            "selectedCompany",
            JSON.stringify(companySession),
          );
          window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
          window.dispatchEvent(new Event("COMPANY_REGISTERED_EVENT"));
        }

        await refreshAccessAfterCompanyRegistration();

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
                {isNonTin
                  ? "No-TIN Company Registration"
                  : "Company Registration Preview"}
              </h2>
              <p className="text-sm text-gray-500">
                {isNonTin
                  ? "Please verify the details. We will send an OTP to confirm the registration."
                  : "Please verify the company details and confirm Registration"}
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
              <span className="text-gray-600">
                {companyData.company_name || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">TIN Number:</span>
              <span className="text-gray-600">
                {companyData.company_tin || "N/A (No TIN)"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">
                {companyData.company_email || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-600">
                {companyData.company_phone || "N/A"}
              </span>
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
              <span className="text-gray-600">
                {companyData.description || "N/A"}
              </span>
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
              <span className="text-gray-600">
                {companyData.fax_number || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Code:</span>
              <span className="text-gray-600">
                {companyData.postal_code || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Address:</span>
              <span className="text-gray-600">
                {companyData.postal_address || "N/A"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-700">Postal Detail:</span>
              <span className="text-gray-600">
                {companyData.postal_detail || "N/A"}
              </span>
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
                {isLoading
                  ? "Sending OTP..."
                  : isNonTin
                    ? "Confirm & Send OTP"
                    : "Approve and Continue"}
              </button>
            </div>
          ) : !showSuccess ? (
            <form onSubmit={handleOtpSubmit} className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  OTP Verification
                </h3>
                <div className="text-sm mb-4 space-y-2">
                  <p className={otpMessage ? "text-blue-600" : "text-gray-500"}>
                    {otpMessage || "A verification code has been sent."}
                  </p>
                  <p className="text-gray-600">
                    {isNonTin ? (
                      <>
                        OTP sent to
                        {companyData.company_email?.trim() ? (
                          <>
                            {" "}Email:{" "}
                            <span className="font-medium text-gray-800 break-all">
                              {companyData.company_email.trim()}
                            </span>
                          </>
                        ) : null}
                        {companyData.company_email?.trim() &&
                        companyData.company_phone?.trim()
                          ? " and"
                          : null}
                        {companyData.company_phone?.trim() ? (
                          <>
                            {" "}SMS:{" "}
                            <span className="font-medium text-gray-800">
                              {companyData.company_phone.trim()}
                            </span>
                          </>
                        ) : null}
                        .
                      </>
                    ) : (
                      <>
                        OTP sent to Email:{" "}
                        <span className="font-medium text-gray-800 break-all">
                          {companyData.company_email?.trim() || "N/A"}
                        </span>{" "}
                        and SMS:{" "}
                        <span className="font-medium text-gray-800">
                          {companyData.company_phone?.trim() || "N/A"}
                        </span>
                        .
                      </>
                    )}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      // Only allow numbers and limit to 6 digits
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
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
                    <span>
                      Resend attempts remaining:{" "}
                      {MAX_RESEND_ATTEMPTS - resendAttempts}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      Maximum resend attempts reached
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={
                    isResending ||
                    resendAttempts >= MAX_RESEND_ATTEMPTS ||
                    resendCooldown > 0
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    resendAttempts >= MAX_RESEND_ATTEMPTS || resendCooldown > 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-50"
                  }`}
                >
                  {isResending
                    ? "Resending..."
                    : resendCooldown > 0
                      ? `Resend OTP (${Math.floor(resendCooldown / 60)}m ${(resendCooldown % 60).toString().padStart(2, "0")}s)`
                      : "Resend OTP"}
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
                {isNonTin
                  ? "The company has been registered successfully without a TIN."
                  : "The company has been registered successfully."}
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

  // Non-TIN registration flow
  // Default selection on the choice step is "I have a TIN".
  const [hasTinChoice, setHasTinChoice] = useState<boolean>(true);
  // Whether the user has confirmed their choice (moves on from the choice step).
  const [hasTin, setHasTin] = useState<boolean | null>(null);
  const [nonTinData, setNonTinData] =
    useState<NonTinCompanyData>(EMPTY_NON_TIN_COMPANY);
  const [nonTinErrors, setNonTinErrors] = useState<
    Partial<Record<keyof NonTinCompanyData, string>>
  >({});
  const [isNonTinPreview, setIsNonTinPreview] = useState(false);

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
      const response = await retryFetch(
        "/api/auth/firm-registration/submit-tin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_tin: tin,
          }),
        },
        {
          maxRetries: 2,
          retryDelay: 2000,
          timeout: 10000,
          onRetry: (retryCount, maxRetries) => {
            setError(
              `Request timed out. Retrying... (${retryCount}/${maxRetries})`,
            );
          },
          onTimeout: () => {
            setError(
              "Request timed out after multiple attempts. Please check your connection and try again.",
            );
          },
        },
      );

      const result = await response.json();
      console.log(result);

      if (result.result?.status === "success") {
        const data = result.result.data;

        // Validate that essential company fields are present
        // Business TINs may return incomplete data, so we need to validate
        if (!data || !data.company_name || !data.company_tin) {
          setError(
            "Invalid TIN. Only Company TINs are allowed. Business TINs cannot be registered. Please enter a valid Company TIN.",
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
            `Incomplete company data. Missing: ${missingFields.join(", ")}. Only valid Company TINs with complete information can be registered.`,
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

  const handleNonTinFieldChange = (
    field: keyof NonTinCompanyData,
    value: string,
  ) => {
    setNonTinData((prev) => ({ ...prev, [field]: value }));
    setNonTinErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** Validate the no-TIN form and open the preview modal for review. */
  const handleNonTinPreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const result = nonTinSchema.safeParse(nonTinData);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof NonTinCompanyData, string>
      > = {};
      result.error.errors.forEach((issue) => {
        const field = issue.path[0] as keyof NonTinCompanyData;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setNonTinErrors(fieldErrors);
      return;
    }

    setNonTinErrors({});
    setCompanyData(mapNonTinToCompanyData(result.data));
    setIsNonTinPreview(true);
    togglePreview(true);
  };

  const resetForm = () => {
    setCompanyTin("");
    setCompanyData(null);
    setIsNonTinPreview(false);
    setNonTinData(EMPTY_NON_TIN_COMPANY);
    setNonTinErrors({});
    setError(undefined);
    setHasTinChoice(true);
    setHasTin(null);
  };

  const handleConfirm = () => {
    togglePreview(false);
    setCompanyTin("");
    setCompanyData(null);
    setIsNonTinPreview(false);
    toggleCompanyTinForm();
    if (onCompanyAdded) onCompanyAdded(); // Notify parent to refresh company list
    window.dispatchEvent(new Event("COMPANY_LIST_UPDATED")); // Notify other components
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-6 py-3.5 border ${
      hasError ? "border-blue-500" : "border-zinc-300"
    } bg-zinc-100 outline-none rounded-[8px] text-black placeholder:text-zinc-400 placeholder:text-[15px] disabled:opacity-60`;

  /** Reusable labelled text input for the no-TIN form. */
  const renderField = (
    label: string,
    field: keyof NonTinCompanyData,
    options?: {
      placeholder?: string;
      type?: string;
      required?: boolean;
      hint?: string;
    },
  ) => (
    <div className="flex flex-col w-full">
      <label className="text-sm py-2 w-full">
        {label}
        {options?.required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={options?.type ?? "text"}
        placeholder={options?.placeholder}
        value={nonTinData[field] ?? ""}
        onChange={(e) => handleNonTinFieldChange(field, e.target.value)}
        className={inputClass(!!nonTinErrors[field])}
        disabled={isLoading}
      />
      {nonTinErrors[field] && (
        <p className="text-blue-500 text-sm mt-1">{nonTinErrors[field]}</p>
      )}
      {!nonTinErrors[field] && options?.hint && (
        <p className="text-xs text-zinc-400 mt-1">{options.hint}</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full">
      <PreviewWidget
        key={companyData?.company_tin ?? "preview-closed"}
        open={previewState}
        onClose={() => {
          togglePreview(false);
          // If the modal was opened from the no-TIN review, return to the form.
          if (isNonTinPreview) {
            setCompanyData(null);
            setIsNonTinPreview(false);
          }
        }}
        companyData={companyData}
        onConfirm={handleConfirm}
        isNonTin={isNonTinPreview}
      />

      {/* Step 0: choose whether the company has a TIN */}
      {hasTin === null ? (
        <div className="flex flex-col w-full pb-10 mt-5">
          <div className="border-t-[0.5px] border-dashed border-gray-400 pt-8">
            <h3 className="text-base font-semibold text-zinc-700">
              Does your company have a TIN number?
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Choose an option to continue with the company registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Has TIN (selected by default) */}
            <button
              type="button"
              role="radio"
              aria-checked={hasTinChoice === true}
              onClick={() => {
                setError(undefined);
                setHasTinChoice(true);
              }}
              className={`group relative flex flex-col items-start gap-3 text-left border-[1.5px] rounded-[12px] p-5 transition-colors cursor-pointer ${
                hasTinChoice === true
                  ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                  : "border-zinc-300 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
            >
              {hasTinChoice === true && (
                <span className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                  <Check size="16" color="#FFFFFF" variant="Bold" />
                </span>
              )}
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                <BuildingIcon color="#2563EB" />
              </span>
              <span className="text-sm font-semibold text-zinc-700">
                Yes, I have a TIN
              </span>
              <span className="text-xs text-zinc-500">
                Register using an existing company TIN. We will fetch and verify
                the company details.
              </span>
            </button>

            {/* No TIN */}
            <button
              type="button"
              role="radio"
              aria-checked={hasTinChoice === false}
              onClick={() => {
                setError(undefined);
                setHasTinChoice(false);
              }}
              className={`group relative flex flex-col items-start gap-3 text-left border-[1.5px] rounded-[12px] p-5 transition-colors cursor-pointer ${
                hasTinChoice === false
                  ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                  : "border-zinc-300 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
            >
              {hasTinChoice === false && (
                <span className="absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                  <Check size="16" color="#FFFFFF" variant="Bold" />
                </span>
              )}
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600">
                <BuildingIcon />
              </span>
              <span className="text-sm font-semibold text-zinc-700">
                No, I don&apos;t have a TIN
              </span>
              <span className="text-xs text-zinc-500">
                Register a company without a TIN by providing its details
                manually.
              </span>
            </button>
          </div>

          <div className="flex flex-row justify-end mt-10">
            <button
              type="button"
              onClick={() => {
                setError(undefined);
                setHasTin(hasTinChoice);
              }}
              className="px-12 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      ) : hasTin ? (
        /* Step 1a: TIN flow (unchanged) */
        <form
          className="flex flex-col w-full pb-10 mt-5"
          onSubmit={handlePreview}
        >
          <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto">
            <div className="flex flex-row gap-6 relative border-t-[0.5px] border-dashed border-gray-400 pt-8">
              <div className="relative w-full">
                <div className="flex w-full items-center justify-between py-2">
                  <span className="text-sm">Company TIN</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasTinChoice(true);
                      setHasTin(null);
                      setError(undefined);
                    }}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
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
      ) : (
        /* Step 1b: No-TIN registration form */
        <form
          className="flex flex-col w-full pb-10 mt-5"
          onSubmit={handleNonTinPreview}
        >
          <div className="border-t-[0.5px] border-dashed border-gray-400 pt-6 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-700">
                Company Details (No TIN)
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Fields marked <span className="text-red-500">*</span> are
                required. Provide at least a company email or a phone number.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasTinChoice(true);
                setHasTin(null);
                setNonTinErrors({});
              }}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-6 overflow-hidden overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {renderField("Company Name", "company_name", {
                placeholder: "Example Company",
                required: true,
              })}
              {renderField("Company Email", "company_email", {
                placeholder: "info@example.com",
                type: "email",
                hint: "Provide at least an email or a phone number",
              })}
              {renderField("Company Phone", "company_phone", {
                placeholder: "+255712345678",
                hint: "Provide at least an email or a phone number",
              })}
              {renderField("Physical Address", "physical_address", {
                placeholder: "Plot 12, Kariakoo, Dar es Salaam",
                required: true,
              })}
              {renderField("Company Nationality Code", "company_nationality_code", {
                placeholder: "TZ",
                required: true,
              })}
              {renderField(
                "Company Registration Type Code",
                "company_registration_type_code",
                { placeholder: "e.g. LTD" },
              )}
              {renderField("Fax Number", "fax_number", {
                placeholder: "Optional",
              })}
              {renderField("Postal Code", "postal_code", {
                placeholder: "2517",
              })}
              {renderField("Postal Address", "postal_address", {
                placeholder: "Dar es Salaam",
              })}
              {renderField("Postal Detail", "postal_detail", {
                placeholder: "Kariakoo",
              })}
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm py-2 w-full">Description</label>
              <textarea
                rows={3}
                placeholder="General trading"
                value={nonTinData.description ?? ""}
                onChange={(e) =>
                  handleNonTinFieldChange("description", e.target.value)
                }
                className={`${inputClass(!!nonTinErrors.description)} resize-none`}
                disabled={isLoading}
              />
              {nonTinErrors.description && (
                <p className="text-blue-500 text-sm mt-1">
                  {nonTinErrors.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row justify-end mt-10">
            <button
              type="submit"
              className="px-12 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Review Company Details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Small inline building glyph used for the TIN choice cards. */
function BuildingIcon({ color = "#D97706" }: { color?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
      <path d="M10 21v-3h4v3" />
    </svg>
  );
}
