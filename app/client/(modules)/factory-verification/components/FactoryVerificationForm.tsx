"use client";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  TextalignJustifyleft,
  Add,
  CloseCircle,
  SearchNormal1,
  Book,
} from "iconsax-reactjs";
import { DatePicker } from "@/components/ui/date-picker";
import HSCodeWidget from "./HSCodeWidget";

interface Product {
  id?: number;
  name: string;
  hs_code: string;
  product_category: string;
  unity_of_measure: string;
}

interface FormProduct {
  product_id?: number;
  name: string;
  hs_code: string;
  description: string;
  company_id: number;
  product_category: string;
  unity_of_measure: string;
  manager_id: number;
  manufacturer?: string;
  manufacturer_id?: number;
}

interface FormData {
  products: FormProduct[];
  expected_inspection_date: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_email: string;
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  hs_code: z.string().min(1, "HS code is required"),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(200, "Product description is too long"),
  company_id: z.number().min(1, "Company ID is required"),
  product_category: z.string().min(1, "Product category is required"),
  unity_of_measure: z.string().min(1, "Unity of measure is required"),
  manager_id: z.number().min(1, "Manager ID is required"),
});

const factoryVerificationSchema = z.object({
  products: z.array(productSchema).min(1, "At least one product is required"),
  expected_inspection_date: z
    .string()
    .min(1, "Expected inspection date is required"),
});

function ProductAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  placeholder,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: Product) => void;
  error?: string;
  placeholder: string;
  loading?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/list?hse=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        if (data.status === "success" && data.data?.products) {
          setSuggestions(data.data.products);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        setShowSuggestions(true);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (product: Product) => {
    onSelect(product);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            onChange(val);
            setSearch(val);
          }}
          onFocus={() =>
            search.trim() !== "" && setShowSuggestions(suggestions.length > 0)
          }
          className={`w-full px-4 sm:px-6 py-2 pr-10 sm:pr-12 border ${
            error ? "border-red-500" : "border-zinc-300"
          } bg-zinc-100 focus:outline-none rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-sm sm:placeholder:text-[15px] text-sm sm:text-base`}
        />
        {isLoading ? (
          <span className="absolute top-2.5 sm:top-3 right-3 sm:right-5">
            <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          </span>
        ) : (
          <SearchNormal1
            size="18"
            className="absolute top-2.5 sm:top-3 right-3 sm:right-5 sm:w-5 sm:h-5"
            color="#9F9FA9"
          />
        )}
      </div>
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-3 sm:px-4 py-2 text-gray-500 text-sm">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((product, index) => (
              <div
                key={index}
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="font-medium text-gray-700 text-sm sm:text-base break-words">{product.name}</div>
                <div className="text-xs sm:text-sm text-gray-500 break-words">
                  HS: {product.hs_code} | {product.product_category} |{" "}
                  {product.unity_of_measure}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 sm:px-4 py-2 text-gray-500 text-sm">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}

function ManufacturerAutocomplete({
  value,
  onChange,
  onSelect,
  error,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (manufacturer: any) => void;
  error?: string;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/manufacturers?search=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
        setShowSuggestions(true);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (manufacturer: any) => {
    onChange(manufacturer.company_name);
    onSelect(manufacturer);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearch(e.target.value);
          }}
          onFocus={() =>
            search.trim() !== "" && setShowSuggestions(suggestions.length > 0)
          }
          className={`w-full px-4 sm:px-6 py-2 pr-10 sm:pr-12 border ${
            error ? "border-red-500" : "border-zinc-300"
          } bg-zinc-100 focus:outline-none rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-sm sm:placeholder:text-[15px] text-sm sm:text-base`}
        />
        {loading ? (
          <span className="absolute top-2.5 sm:top-3 right-3 sm:right-5">
            <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          </span>
        ) : (
          <SearchNormal1
            size="18"
            className="absolute top-2.5 sm:top-3 right-3 sm:right-5 sm:w-5 sm:h-5"
            color="#9F9FA9"
          />
        )}
      </div>
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 sm:px-4 py-2 text-gray-500 text-sm">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((manufacturer, index) => (
              <div
                key={manufacturer.id || index}
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(manufacturer)}
              >
                <div className="font-medium text-gray-700 text-sm sm:text-base break-words">
                  {manufacturer.company_name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 break-words">
                  {manufacturer.company_tin} | {manufacturer.company_email}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 sm:px-4 py-2 text-gray-500 text-sm">
              No manufacturers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Improved date formatter
function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  }
  if (dateStr.includes("/")) {
    // Already in dd/mm/yyyy
    return dateStr;
  }
  return dateStr;
}

function PreviewWidget({
  open,
  onClose,
  formData,
  getValidFormData,
  onFormClose,
  onRefreshList,
}: {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  getValidFormData: () => FormData;
  onFormClose?: () => void;
  onRefreshList?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        setSubmitError("No company selected. Please select a company first.");
        setIsSubmitting(false);
        return;
      }
      const { company_tin } = JSON.parse(selectedCompany);
      const validFormData = getValidFormData();
      // Debug logs
      console.log("formData before submit:", validFormData);
      // Check for missing manufacturer_id or product_id
      const missingManufacturer = validFormData.products.some(
        (product: FormProduct) => !product.manufacturer_id
      );
      const missingProductId = validFormData.products.some(
        (product: FormProduct) => !product.product_id
      );
      if (missingManufacturer) {
        setSubmitError(
          "Please select a manufacturer from the dropdown for each product."
        );
        setIsSubmitting(false);
        return;
      }
      if (missingProductId) {
        setSubmitError(
          "Please select a product from the dropdown for each product."
        );
        setIsSubmitting(false);
        return;
      }
      // Build payload as required
      console.log(
        "expected_inspection_date raw:",
        validFormData.expected_inspection_date
      );
      const payload = {
        company_tin,
        applicant_name: validFormData.applicant_name,
        applicant_phone: validFormData.applicant_phone,
        applicant_email: validFormData.applicant_email,
        suggested_inspection_date: validFormData.expected_inspection_date
          ? formatDateToDDMMYYYY(validFormData.expected_inspection_date)
          : null,
        products: validFormData.products.map((product: FormProduct) => ({
          manufacturer_id: product.manufacturer_id,
          product_name_id: product.product_id,
          description: product.description,
        })),
      };
      console.log("payload to be sent:", payload);
      const response = await fetch("/api/factory-verification/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === "success") {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          // Close the form and refresh the list
          if (onFormClose) onFormClose();
          if (onRefreshList) onRefreshList();
        }, 2000); // Reduced from 3000 to 2000 for better UX
      } else {
        setSubmitError(result.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
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
        <div className="relative w-full max-w-md flex flex-col bg-white rounded-xl shadow-2xl p-8 animate-fadeIn">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">
              Your factory verification application has been submitted
              successfully.
            </p>
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Application ID:</span>
                  <span className="font-medium">
                    #{Date.now().toString().slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Submitted:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">
                    Pending Review
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-1.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="relative w-full max-w-7xl h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl animate-fadeIn mx-2 sm:mx-4">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                Factory Verification Application
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Review your application before submission
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start"
              aria-label="Close preview"
            >
              <CloseCircle size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Edit Application</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Panel - Application & Applicant Details */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-6 overflow-y-auto min-w-0">
            <div className="space-y-6">
              {/* Applicant Information */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  Applicant Information
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="break-words">
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {formData.applicant_name}
                    </span>
                  </div>
                  <div className="break-words">
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {formData.applicant_phone}
                    </span>
                  </div>
                  <div className="break-words">
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {formData.applicant_email}
                    </span>
                  </div>
                </div>
              </div>
              {/* Inspection Date */}
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
                  Inspection Details
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="break-words">
                    <span className="text-gray-600">
                      Suggested Inspection Date:
                    </span>{" "}
                    <span className="font-medium text-gray-800">
                      {formData.expected_inspection_date
                        ? formatDateToDDMMYYYY(
                            formData.expected_inspection_date
                          )
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Product List with Manufacturer Info */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Products for Verification
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">
                      Review all products included in this application
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {formData.products.length} Products
                    </div>
                  </div>
                </div>
              </div>
              {/* Product Details (summary only) */}
              <div className="flex-1 overflow-y-auto">
                <div className="min-h-full space-y-4 sm:space-y-6 p-3 sm:p-4">
                  {formData.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm"
                    >
                      <div className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">
                        Product #{idx + 1}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>{" "}
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">HS Code:</span>{" "}
                          <span className="font-mono">{product.hs_code}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Product ID:</span>{" "}
                          <span className="font-mono">
                            {product.product_id ?? "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Product Category:
                          </span>{" "}
                          <span className="font-medium">
                            {product.product_category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Unity of Measure:
                          </span>{" "}
                          <span className="font-medium">
                            {product.unity_of_measure}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Description:</span>{" "}
                          <span className="font-medium">
                            {product.description}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Manufacturer Name:
                          </span>{" "}
                          <span className="font-medium">
                            {product.manufacturer || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Manufacturer ID:
                          </span>{" "}
                          <span className="font-mono">
                            {product.manufacturer_id ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600">
              Total Products:{" "}
              <span className="font-semibold text-gray-800">
                {formData.products.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Error Message */}
              {submitError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 text-xs sm:text-sm">{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Submitting...</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                    <span className="text-xs sm:text-sm">Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FactoryVerificationForm({
  onFormClose,
  onRefreshList,
}: {
  onFormClose?: () => void;
  onRefreshList?: () => void;
} = {}) {
  const [formData, setFormData] = useState<FormData>({
    products: [
      {
        name: "",
        hs_code: "",
        description: "",
        company_id: 2,
        product_category: "",
        unity_of_measure: "",
        manager_id: 2,
        manufacturer: "",
        manufacturer_id: undefined,
        product_id: undefined,
      },
    ],
    expected_inspection_date: "",
    applicant_name: "",
    applicant_phone: "",
    applicant_email: "",
  });

  const [errors, setErrors] = useState<{
    products: {
      name?: string;
      hs_code?: string;
      description?: string;
      product_category?: string;
      unity_of_measure?: string;
    }[];
    expected_inspection_date?: string;
    applicant_name?: string;
    applicant_phone?: string;
    applicant_email?: string;
  }>({
    products: [{}],
    expected_inspection_date: undefined,
    applicant_name: undefined,
    applicant_phone: undefined,
    applicant_email: undefined,
  });

  const [previewState, togglePreview] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const manufacturers = ["Manufacturer A", "Manufacturer B", "Manufacturer C"];
  const [manufacturerSearch, setManufacturerSearch] = useState<string[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<any[][]>([]);
  const [manufacturerLoading, setManufacturerLoading] = useState<boolean[]>([]);
  const [manufacturerError, setManufacturerError] = useState<(string | null)[]>(
    []
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setManufacturerSearch((prev) =>
      formData.products.map((_, i) => prev[i] || "")
    );
    setManufacturerOptions((prev) =>
      formData.products.map((_, i) => prev[i] || [])
    );
    setManufacturerLoading((prev) =>
      formData.products.map((_, i) => prev[i] || false)
    );
    setManufacturerError((prev) =>
      formData.products.map((_, i) => prev[i] || null)
    );
  }, [formData.products.length]);

  useEffect(() => {
    formData.products.forEach((_, idx) => {
      const search = manufacturerSearch[idx];
      if (!search) {
        setManufacturerOptions((prev) => {
          const next = [...prev];
          next[idx] = [];
          return next;
        });
        return;
      }
      setManufacturerLoading((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/manufacturers?search=${encodeURIComponent(search)}`
          );
          const data = await res.json();
          setManufacturerOptions((prev) => {
            const next = [...prev];
            next[idx] = data.data || [];
            return next;
          });
          setManufacturerError((prev) => {
            const next = [...prev];
            next[idx] = null;
            return next;
          });
        } catch {
          setManufacturerOptions((prev) => {
            const next = [...prev];
            next[idx] = [];
            return next;
          });
          setManufacturerError((prev) => {
            const next = [...prev];
            next[idx] = "Failed to fetch manufacturers";
            return next;
          });
        } finally {
          setManufacturerLoading((prev) => {
            const next = [...prev];
            next[idx] = false;
            return next;
          });
        }
      }, 300);
      return () => clearTimeout(timeout);
    });
  }, [manufacturerSearch, formData.products.length]);

  const validateProduct = (product: FormProduct, index: number) => {
    const productErrors: any = {};

    if (!product.name.trim()) {
      productErrors.name = "Product name is required";
    }

    if (!product.hs_code.trim()) {
      productErrors.hs_code = "HS code is required";
    }

    if (!product.description.trim()) {
      productErrors.description = "Product description is required";
    } else if (product.description.length > 200) {
      productErrors.description = "Product description is too long";
    }

    if (!product.product_category.trim()) {
      productErrors.product_category = "Product category is required";
    }

    if (!product.unity_of_measure.trim()) {
      productErrors.unity_of_measure = "Unity of measure is required";
    }

    return productErrors;
  };

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validatePhone(phone: string) {
    return /^\d{7,15}$/.test(phone.replace(/\D/g, ""));
  }

  // Phone number validation - only allow numbers
  const handlePhoneInput = (value: string) => {
    // Remove any non-numeric characters except + at the beginning
    const cleanedValue = value.replace(/[^\d+]/g, '');
    // Ensure + can only be at the beginning
    if (cleanedValue.includes('+') && cleanedValue.indexOf('+') !== 0) {
      return cleanedValue.replace(/\+/g, '');
    }
    return cleanedValue;
  };

  const validateApplicantFields = (formData: FormData) => {
    const errors: any = {};
    if (!formData.applicant_name.trim()) {
      errors.applicant_name = "Applicant name is required";
    }
    if (!formData.applicant_phone.trim()) {
      errors.applicant_phone = "Applicant phone is required";
    } else if (!validatePhone(formData.applicant_phone)) {
      errors.applicant_phone = "Invalid phone number format";
    }
    if (!formData.applicant_email.trim()) {
      errors.applicant_email = "Applicant email is required";
    } else if (!validateEmail(formData.applicant_email)) {
      errors.applicant_email = "Invalid email format";
    }
    return errors;
  };

  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: any = {
      products: formData.products.map((product, index) =>
        validateProduct(product, index)
      ),
      expected_inspection_date: undefined,
      applicant_name: undefined,
      applicant_phone: undefined,
      applicant_email: undefined,
    };
    if (!formData.expected_inspection_date.trim()) {
      newErrors.expected_inspection_date =
        "Expected inspection date is required";
    }
    // Validate applicant fields
    const applicantFieldErrors = validateApplicantFields(formData);
    Object.assign(newErrors, applicantFieldErrors);
    const hasErrors =
      newErrors.expected_inspection_date ||
      newErrors.applicant_name ||
      newErrors.applicant_phone ||
      newErrors.applicant_email ||
      newErrors.products.some(
        (productErrors: any) => Object.keys(productErrors).length > 0
      );
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    setErrors({
      products: formData.products.map(() => ({})),
      expected_inspection_date: undefined,
      applicant_name: undefined,
      applicant_phone: undefined,
      applicant_email: undefined,
    });
    getFormSummary();
    togglePreview(true);
  };

  const handleInputChange = (
    idx: number,
    field: keyof FormProduct,
    value: string | number
  ) => {
    const updatedFormData = { ...formData };
    if (field === "company_id" || field === "manager_id" || field === "product_id") {
      (updatedFormData.products[idx] as any)[field] = value as number;
    } else {
      (updatedFormData.products[idx] as any)[field] = value as string;
    }
    setFormData(updatedFormData);

    const updatedErrors = { ...errors };
    if (updatedErrors.products[idx] && field in updatedErrors.products[idx]) {
      (updatedErrors.products[idx] as any)[field] = undefined;
      setErrors(updatedErrors);
    }
  };

  const handleDateChange = (value: string) => {
    setFormData({ ...formData, expected_inspection_date: value });
    if (errors.expected_inspection_date) {
      setErrors({ ...errors, expected_inspection_date: undefined });
    }
  };

  const handleProductSelect = (idx: number, product: Product) => {
    const updatedFormData = { ...formData };
    updatedFormData.products[idx] = {
      ...updatedFormData.products[idx],
      product_id: product.id,
      name: product.name,
      hs_code: product.hs_code,
      product_category: product.product_category,
      unity_of_measure: product.unity_of_measure,
    };
    setFormData(updatedFormData);

    const updatedErrors = { ...errors };
    if (updatedErrors.products[idx]) {
      updatedErrors.products[idx].name = undefined;
      updatedErrors.products[idx].hs_code = undefined;
      updatedErrors.products[idx].product_category = undefined;
      updatedErrors.products[idx].unity_of_measure = undefined;
      setErrors(updatedErrors);
    }
  };

  const handleAddProduct = () => {
    const newProduct = {
      name: "",
      hs_code: "",
      description: "",
      company_id: 2,
      product_category: "",
      unity_of_measure: "",
      manager_id: 2,
      manufacturer: "",
      manufacturer_id: undefined,
      product_id: undefined,
    };

    setFormData({
      ...formData,
      products: [...formData.products, newProduct],
    });

    setErrors({
      ...errors,
      products: [...errors.products, {}],
    });
  };

  const handleRemoveProduct = (idx: number) => {
    if (formData.products.length === 1) return;

    const updatedProducts = formData.products.filter((_, i) => i !== idx);
    const updatedErrors = errors.products.filter((_, i) => i !== idx);

    setFormData({
      ...formData,
      products: updatedProducts,
    });

    setErrors({
      ...errors,
      products: updatedErrors,
    });
  };

  const getValidFormData = (): FormData => {
    return {
      products: formData.products.map((product) => ({
        product_id: product.product_id, // Keep original product_id if exists, don't default to 1
        name: product.name.trim(),
        hs_code: product.hs_code.trim(),
        description: product.description.trim(),
        company_id: product.company_id,
        product_category: product.product_category.trim(),
        unity_of_measure: product.unity_of_measure.trim(),
        manager_id: product.manager_id,
        manufacturer: product.manufacturer,
        manufacturer_id: product.manufacturer_id,
      })),
      expected_inspection_date: formData.expected_inspection_date.trim(),
      applicant_name: formData.applicant_name.trim(),
      applicant_phone: formData.applicant_phone.trim(),
      applicant_email: formData.applicant_email.trim(),
    };
  };

  const ensureFormCompleteness = (): boolean => {
    const validFormData = getValidFormData();

    // Check if all products have required fields
    const allProductsValid = validFormData.products.every(
      (product) =>
        product.name.length > 0 &&
        product.hs_code.length > 0 &&
        product.description.length > 0 &&
        product.product_category.length > 0 &&
        product.unity_of_measure.length > 0
    );

    // Check if inspection date is set
    const hasInspectionDate = validFormData.expected_inspection_date.length > 0;

    return allProductsValid && hasInspectionDate;
  };

  // Function to get form summary for debugging
  const getFormSummary = () => {
    const validFormData = getValidFormData();
    console.log("Form Data Summary:", {
      totalProducts: validFormData.products.length,
      products: validFormData.products.map((p, idx) => ({
        index: idx,
        name: p.name,
        hs_code: p.hs_code,
        description: p.description,
        product_category: p.product_category,
        unity_of_measure: p.unity_of_measure,
        product_id: p.product_id,
      })),
      expected_inspection_date: validFormData.expected_inspection_date,
      isComplete: ensureFormCompleteness(),
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        formData={getValidFormData()}
        getValidFormData={getValidFormData}
        onFormClose={onFormClose}
        onRefreshList={onRefreshList}
      />

      <HSCodeWidget open={open} onClose={() => setOpen(false)} />

      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto h-[700px] pr-3">
          {/* Applicant Information */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-2">
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                Applicant Name
              </label>
              <input
                type="text"
                placeholder="Enter applicant name"
                value={formData.applicant_name}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_name: e.target.value })
                }
                className="w-full px-3 py-2 border text-sm border-zinc-300 bg-white rounded-md placeholder:text-zinc-400 text-zinc-500 focus:outline-none"
              />
              {errors.applicant_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.applicant_name}
                </p>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                Applicant Phone
              </label>
              <input
                type="tel"
                placeholder="Enter applicant phone"
                value={formData.applicant_phone}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_phone: handlePhoneInput(e.target.value) })
                }
                className="w-full px-3 py-2 border text-sm border-zinc-300 bg-white rounded-md placeholder:text-zinc-400 text-zinc-500 focus:outline-none"
                inputMode="tel"
                pattern="[0-9+]*"
              />
              {errors.applicant_phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.applicant_phone}
                </p>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-sm text-gray-600 mb-1">
                Applicant Email
              </label>
              <input
                type="email"
                placeholder="Enter applicant email"
                value={formData.applicant_email}
                onChange={(e) =>
                  setFormData({ ...formData, applicant_email: e.target.value })
                }
                className="w-full px-3 py-2 border text-sm border-zinc-300 bg-white rounded-md placeholder:text-zinc-400 text-zinc-500 focus:outline-none"
              />
              {errors.applicant_email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.applicant_email}
                </p>
              )}
            </div>
          </div>

          {/* Header with Date Picker */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-4 sm:gap-0">
            <div className="text-base sm:text-lg font-semibold text-gray-700">
              Factory Verification Application
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
              <div className="text-sm text-gray-600">
                Expected Inspection Date
              </div>
              <DatePicker
                value={formData.expected_inspection_date}
                onChange={handleDateChange}
                error={errors.expected_inspection_date}
                placeholder="Select date"
                className="w-full sm:w-auto py-2 sm:py-4"
              />
              {errors.expected_inspection_date && (
                <p className="text-red-500 text-xs">
                  {errors.expected_inspection_date}
                </p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Products to be Verified
          </div>

          {formData.products.map((product, idx) => (
            <div
              className="flex flex-col gap-3 relative border border-gray-200 rounded-lg p-4 bg-gray-50"
              key={idx}
            >
              {/* Manufacturer Input for each product */}
              <div className="flex flex-col gap-1 mb-2">
                <label className="text-sm text-gray-600">Manufacturer</label>
                <ManufacturerAutocomplete
                  value={product.manufacturer || ""}
                  onChange={(value) =>
                    handleInputChange(idx, "manufacturer", value)
                  }
                  onSelect={(manufacturer) => {
                    handleInputChange(
                      idx,
                      "manufacturer",
                      manufacturer.company_name
                    );
                    handleInputChange(idx, "manufacturer_id", manufacturer.id);
                  }}
                  placeholder="Search manufacturer..."
                  error={undefined}
                />
              </div>
              <div className="relative w-full">
                <div className="text-sm text-gray-600 mb-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Product HS Code</span>
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 flex flex-row gap-2 items-center border-1 border-blue-500 rounded-[5px] px-3 py-1 cursor-pointer self-start sm:self-auto"
                    onClick={() => setOpen(true)}
                  >
                    <Book size="16" color="white" />
                    <span className="text-[10px] text-white">HS Code List</span>
                  </button>
                </div>
                <div>
                  <ProductAutocomplete
                    value={product.hs_code}
                    onChange={(val) => handleInputChange(idx, "hs_code", val)}
                    onSelect={(selectedProduct) => {
                      handleInputChange(idx, "name", selectedProduct.name);
                      handleInputChange(
                        idx,
                        "hs_code",
                        selectedProduct.hs_code
                      );
                      handleInputChange(
                        idx,
                        "product_category",
                        selectedProduct.product_category
                      );
                      handleInputChange(
                        idx,
                        "unity_of_measure",
                        selectedProduct.unity_of_measure
                      );
                      handleInputChange(
                        idx,
                        "product_id",
                        selectedProduct.id ?? 0
                      );
                    }}
                    placeholder="Search HS Code..."
                    error={errors.products[idx]?.hs_code}
                  />
                </div>
                {errors.products[idx]?.hs_code && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.products[idx]?.hs_code}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <div className="text-sm text-gray-600 mb-1">Product name</div>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={product.name}
                    onChange={(e) =>
                      handleInputChange(idx, "name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border text-sm ${
                      errors.products[idx]?.name
                        ? "border-red-500"
                        : "border-zinc-300"
                    } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                    readOnly
                  />
                  {errors.products[idx]?.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[idx]?.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="text-sm text-gray-600 mb-1">
                    Product Category
                  </div>
                  <input
                    type="text"
                    placeholder="Category"
                    value={product.product_category}
                    onChange={(e) =>
                      handleInputChange(idx, "product_category", e.target.value)
                    }
                    className={`w-full px-3 py-2 border text-sm ${
                      errors.products[idx]?.product_category
                        ? "border-red-500"
                        : "border-zinc-300"
                    } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                    readOnly
                  />
                  {errors.products[idx]?.product_category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[idx]?.product_category}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                  <div className="text-sm text-gray-600 mb-1">
                    Unity of Measure
                  </div>
                  <input
                    type="text"
                    placeholder="Unity"
                    value={product.unity_of_measure}
                    onChange={(e) =>
                      handleInputChange(idx, "unity_of_measure", e.target.value)
                    }
                    className={`w-full px-3 py-2 border text-sm ${
                      errors.products[idx]?.unity_of_measure
                        ? "border-red-500"
                        : "border-zinc-300"
                    } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                    readOnly
                  />
                  {errors.products[idx]?.unity_of_measure && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[idx]?.unity_of_measure}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col w-full">
                <div className="text-sm text-gray-600 mb-1">
                  Product Description
                </div>
                <textarea
                  placeholder="Brief description of the product to be verified..."
                  rows={3}
                  value={product.description}
                  onChange={(e) =>
                    handleInputChange(idx, "description", e.target.value)
                  }
                  className={`w-full border text-sm ${
                    errors.products[idx]?.description
                      ? "border-red-500"
                      : "border-zinc-300"
                  } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                ></textarea>
                {errors.products[idx]?.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.products[idx]?.description}
                  </p>
                )}
              </div>

              {formData.products.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(idx)}
                  className="flex flex-row cursor-pointer justify-center items-center gap-2 absolute top-2 right-2 text-red-500 text-xs hover:text-red-700 bg-red-50 px-2 py-1 rounded z-10"
                  aria-label="Remove product"
                >
                  <span className="hidden sm:inline">Remove</span>
                  <CloseCircle size={14} color="#ef4444" />
                </button>
              )}
            </div>
          ))}

          <div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="flex flex-row justify-center items-center gap-2 cursor-pointer border border-dashed border-gray-400 py-3 text-gray-500 text-sm bg-gray-50 hover:bg-gray-100 rounded-md w-full transition-colors"
            >
              <Add size={20} color="gray" />
              Add another product
            </button>
          </div>
        </div>

        <div className="w-full flex items-center justify-center sm:justify-end mt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 sm:px-8 py-2 bg-blue-500 text-white rounded-[7px] hover:bg-blue-600 cursor-pointer text-sm font-medium"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}
