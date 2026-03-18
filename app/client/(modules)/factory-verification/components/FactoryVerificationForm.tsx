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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ParticularsOfGoods {
  production_process: string;
  materials_imported: string;
  materials_eac_origin: string;
  containers_packing: string;
  import_duty_paid: string;
  direct_labour_costs: string;
  ex_factory_costs: string;
  exterior_packing_cost: string;
  profit_markup: string;
  wholesale_price: string;
  declaration_name_designation: string;
  declaration_firm_name: string;
  declaration_physical_location: string;
  declaration_address: string;
  certification_place_date: string;
  certification_name_signature: string;
  action: string;
}

interface FormData {
  products: FormProduct[];
  expected_inspection_date: string;
  applicant_name: string;
  applicant_phone: string;
  applicant_email: string;
  trade_region: number | null;
}

interface OriginCriterion {
  id: number;
  name: string;
  code_number: string;
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
  userType,
  particularsOfGoods,
  originCriterions,
}: {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  getValidFormData: () => FormData;
  onFormClose?: () => void;
  onRefreshList?: () => void;
  userType: ("exporter" | "manufacturer" | "")[];
  particularsOfGoods: ParticularsOfGoods | null;
  originCriterions: OriginCriterion[];
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
      // Check for missing manufacturer_id only for exporters
      const missingManufacturer = validFormData.products.some(
        (product: FormProduct, index: number) => 
          userType[index] === "exporter" && !product.manufacturer_id
      );
      const missingProductId = validFormData.products.some(
        (product: FormProduct) => !product.product_id
      );
      if (missingManufacturer) {
        setSubmitError(
          "Please select a manufacturer from the dropdown for each product where you are an Exporter."
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
      const payload: any = {
        company_tin,
        applicant_name: validFormData.applicant_name,
        applicant_phone: validFormData.applicant_phone,
        applicant_email: validFormData.applicant_email,
        trade_region: validFormData.trade_region,
        suggested_inspection_date: validFormData.expected_inspection_date
          ? formatDateToDDMMYYYY(validFormData.expected_inspection_date)
          : null,
        products: validFormData.products.map((product: FormProduct, index: number) => ({
          // Only include manufacturer_id if user is an exporter
          ...(userType[index] === "exporter" && product.manufacturer_id
            ? { manufacturer_id: product.manufacturer_id }
            : {}),
          product_name_id: product.product_id,
          description: product.description,
        })),
      };

      // Include particulars_of_goods if product_category is "manufactured"
      const hasManufacturedProduct = validFormData.products.some(
        (product: FormProduct) => product.product_category?.toLowerCase() === "manufactured"
      );
      
      if (hasManufacturedProduct && particularsOfGoods) {
        payload.particulars_of_goods = particularsOfGoods;
      }

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
                  <div className="break-words">
                    <span className="text-gray-600">Trade Region:</span>{" "}
                    <span className="font-medium text-gray-800">
                      {formData.trade_region
                        ? originCriterions.find((o) => o.id === formData.trade_region)
                            ?.name || `#${formData.trade_region}`
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

                  {/* Particulars of Goods Section */}
                  {particularsOfGoods && formData.products.some(
                    (product) => product.product_category?.toLowerCase() === "manufactured"
                  ) && (
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white shadow-sm mt-4">
                      <div className="font-semibold text-green-700 mb-3 text-sm sm:text-base">
                        PART A
                      </div>
                      <div className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
                        Particulars of the Goods in Respect of which Evidence of Origin is required
                      </div>
                      <div className="space-y-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-700 font-medium">Production process(es) carried out:</span>
                          <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                            {particularsOfGoods.production_process || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Materials imported from outside the Partner State used in the manufacture of the goods described in the Certificate, their respective customs values and HS Codes:</span>
                          <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                            {particularsOfGoods.materials_imported || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Materials of East African Community origin used in the manufacture of the goods described in the Certificate, the respective custom value and HS Codes:</span>
                          <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                            {particularsOfGoods.materials_eac_origin || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Containers or other forms of interior packing normally sold with the goods at retail level or the materials used in their manufacture, their origin, customs values and HS Codes:</span>
                          <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                            {particularsOfGoods.containers_packing || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Import duty, if any, paid on the materials imported from outside the Partner State:</span>
                          <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                            {particularsOfGoods.import_duty_paid || "-"}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2">
                          <div>
                            <span className="text-gray-700 font-medium">Direct labour costs and factory overheads:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {particularsOfGoods.direct_labour_costs || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Ex-factory costs of the goods produced:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {particularsOfGoods.ex_factory_costs || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">The cost of exterior packing:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {particularsOfGoods.exterior_packing_cost || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Profit mark-up on the goods produced:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {particularsOfGoods.profit_markup || "-"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-gray-700 font-medium">The wholesale price of the goods in the country of manufacture:</span>{" "}
                            <span className="font-medium text-gray-800">
                              {particularsOfGoods.wholesale_price || "-"}
                            </span>
                          </div>
                        </div>

                        {/* Declaration Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                            Declaration
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 italic mb-3">
                            Declare that the above details and statements are correct and that they are furnished in cognizance of the requirements of the Rules of Origin.
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2">
                            <div>
                              <span className="text-gray-700 font-medium">Name and Designation:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.declaration_name_designation || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium">Name of the Firm:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.declaration_firm_name || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium">Physical Location:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.declaration_physical_location || "-"}
                              </span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-gray-700 font-medium">Address:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.declaration_address || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PART B - Certification Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="font-semibold text-green-700 mb-2 text-sm sm:text-base">
                            PART B – Certification
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 italic mb-3">
                            It is hereby certified, on the basis of control carried out that the declaration by the exporter is correct.
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-2">
                            <div>
                              <span className="text-gray-700 font-medium">Place and Date:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.certification_place_date || "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-700 font-medium">Name and Signature:</span>{" "}
                              <span className="font-medium text-gray-800">
                                {particularsOfGoods.certification_name_signature || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
    trade_region: null,
  });

  const [errors, setErrors] = useState<{
    products: {
      name?: string;
      hs_code?: string;
      description?: string;
      product_category?: string;
      unity_of_measure?: string;
      userType?: string;
      manufacturer?: string;
    }[];
    expected_inspection_date?: string;
    applicant_name?: string;
    applicant_phone?: string;
    applicant_email?: string;
    trade_region?: string;
    particularsOfGoods?: {
      production_process?: string;
      materials_imported?: string;
      materials_eac_origin?: string;
      containers_packing?: string;
      import_duty_paid?: string;
      direct_labour_costs?: string;
      ex_factory_costs?: string;
      exterior_packing_cost?: string;
      profit_markup?: string;
      wholesale_price?: string;
      declaration_name_designation?: string;
      declaration_firm_name?: string;
      declaration_physical_location?: string;
      declaration_address?: string;
      certification_place_date?: string;
      certification_name_signature?: string;
    };
  }>({
    products: [{}],
    expected_inspection_date: undefined,
    applicant_name: undefined,
    applicant_phone: undefined,
    applicant_email: undefined,
    trade_region: undefined,
    particularsOfGoods: undefined,
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
  const [userType, setUserType] = useState<("exporter" | "manufacturer" | "")[]>([]);
  const [particularsOfGoods, setParticularsOfGoods] = useState<ParticularsOfGoods | null>(null);
  const [originCriterions, setOriginCriterions] = useState<OriginCriterion[]>([]);
  const [originCriterionsLoading, setOriginCriterionsLoading] = useState(false);
  const [originCriterionsError, setOriginCriterionsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setOriginCriterionsLoading(true);
      setOriginCriterionsError(null);
      try {
        const res = await fetch("/api/origin-criterions", { method: "GET" });
        const data = await res.json();
        if (!alive) return;
        const list = Array.isArray(data?.origin_criterions)
          ? (data.origin_criterions as OriginCriterion[])
          : Array.isArray(data?.originCriterions)
          ? (data.originCriterions as OriginCriterion[])
          : [];
        setOriginCriterions(list);
      } catch (e) {
        if (!alive) return;
        setOriginCriterions([]);
        setOriginCriterionsError("Failed to load trade regions");
      } finally {
        if (!alive) return;
        setOriginCriterionsLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  // Helper function to get default particulars object
  const getDefaultParticulars = (): ParticularsOfGoods => ({
    production_process: "",
    materials_imported: "",
    materials_eac_origin: "",
    containers_packing: "",
    import_duty_paid: "",
    direct_labour_costs: "",
    ex_factory_costs: "",
    exterior_packing_cost: "",
    profit_markup: "",
    wholesale_price: "",
    declaration_name_designation: "",
    declaration_firm_name: "",
    declaration_physical_location: "",
    declaration_address: "",
    certification_place_date: "",
    certification_name_signature: "",
    action: "submit",
  });

  // Helper function to update particulars safely
  const updateParticulars = (field: keyof ParticularsOfGoods, value: string) => {
    setParticularsOfGoods({
      ...(particularsOfGoods || getDefaultParticulars()),
      [field]: value,
    });
    // Clear error for this field when user starts typing
    if (errors.particularsOfGoods && errors.particularsOfGoods[field as keyof typeof errors.particularsOfGoods]) {
      const newErrors = { ...errors };
      if (newErrors.particularsOfGoods) {
        delete newErrors.particularsOfGoods[field as keyof typeof newErrors.particularsOfGoods];
        if (Object.keys(newErrors.particularsOfGoods).length === 0) {
          newErrors.particularsOfGoods = undefined;
        }
      }
      setErrors(newErrors);
    }
  };

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
    setUserType((prev) =>
      formData.products.map((_, i) => prev[i] || "")
    );
  }, [formData.products.length]);

  // Initialize particularsOfGoods if product is manufactured but particulars is null
  useEffect(() => {
    if (formData.products.length > 0) {
      const firstProduct = formData.products[0];
      if (firstProduct.product_category?.toLowerCase() === "manufactured" && !particularsOfGoods) {
        setParticularsOfGoods(getDefaultParticulars());
      } else if (firstProduct.product_category?.toLowerCase() !== "manufactured" && particularsOfGoods) {
        setParticularsOfGoods(null);
      }
    }
  }, [formData.products]);

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

    if (!userType[index] || (userType[index] !== "exporter" && userType[index] !== "manufacturer")) {
      productErrors.userType = "Please select whether you are an Exporter or Manufacturer";
    }

    // If user is an exporter, manufacturer is required
    if (userType[index] === "exporter") {
      if (!product.manufacturer || !product.manufacturer.trim()) {
        productErrors.manufacturer = "Manufacturer is required when you are an Exporter";
      } else if (!product.manufacturer_id) {
        productErrors.manufacturer = "Please select a valid manufacturer from the list";
      }
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

  const validateParticularsOfGoods = (): any => {
    const errors: any = {};
    
    if (!particularsOfGoods) {
      return null; // No validation needed if form is not displayed
    }

    if (!particularsOfGoods.production_process?.trim()) {
      errors.production_process = "Production process is required";
    }
    if (!particularsOfGoods.materials_imported?.trim()) {
      errors.materials_imported = "Materials imported is required";
    }
    if (!particularsOfGoods.materials_eac_origin?.trim()) {
      errors.materials_eac_origin = "Materials EAC origin is required";
    }
    if (!particularsOfGoods.containers_packing?.trim()) {
      errors.containers_packing = "Containers/packing is required";
    }
    if (!particularsOfGoods.import_duty_paid?.trim()) {
      errors.import_duty_paid = "Import duty paid is required";
    }
    if (!particularsOfGoods.direct_labour_costs?.trim()) {
      errors.direct_labour_costs = "Direct labour costs is required";
    }
    if (!particularsOfGoods.ex_factory_costs?.trim()) {
      errors.ex_factory_costs = "Ex-factory costs is required";
    }
    if (!particularsOfGoods.exterior_packing_cost?.trim()) {
      errors.exterior_packing_cost = "Exterior packing cost is required";
    }
    if (!particularsOfGoods.profit_markup?.trim()) {
      errors.profit_markup = "Profit mark-up is required";
    }
    if (!particularsOfGoods.wholesale_price?.trim()) {
      errors.wholesale_price = "Wholesale price is required";
    }
    if (!particularsOfGoods.declaration_name_designation?.trim()) {
      errors.declaration_name_designation = "Declaration name and designation is required";
    }
    if (!particularsOfGoods.declaration_firm_name?.trim()) {
      errors.declaration_firm_name = "Declaration firm name is required";
    }
    if (!particularsOfGoods.declaration_physical_location?.trim()) {
      errors.declaration_physical_location = "Declaration physical location is required";
    }
    if (!particularsOfGoods.declaration_address?.trim()) {
      errors.declaration_address = "Declaration address is required";
    }
    if (!particularsOfGoods.certification_place_date?.trim()) {
      errors.certification_place_date = "Certification place and date is required";
    }
    if (!particularsOfGoods.certification_name_signature?.trim()) {
      errors.certification_name_signature = "Certification name and signature is required";
    }

    return Object.keys(errors).length > 0 ? errors : null;
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
      trade_region: undefined,
      particularsOfGoods: undefined,
    };
    if (!formData.expected_inspection_date.trim()) {
      newErrors.expected_inspection_date =
        "Expected inspection date is required";
    }
    if (!formData.trade_region) {
      newErrors.trade_region = "Trade region is required";
    }
    // Validate applicant fields
    const applicantFieldErrors = validateApplicantFields(formData);
    Object.assign(newErrors, applicantFieldErrors);
    
    // Validate particulars of goods if form is displayed (product is manufactured)
    const hasManufacturedProduct = formData.products.some(
      (product) => product.product_category?.toLowerCase() === "manufactured"
    );
    if (hasManufacturedProduct) {
      const particularsErrors = validateParticularsOfGoods();
      if (particularsErrors) {
        newErrors.particularsOfGoods = particularsErrors;
      }
    }
    
    const hasErrors =
      newErrors.expected_inspection_date ||
      newErrors.applicant_name ||
      newErrors.applicant_phone ||
      newErrors.applicant_email ||
      newErrors.trade_region ||
      newErrors.particularsOfGoods ||
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
      trade_region: undefined,
      particularsOfGoods: undefined,
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

    // Initialize particulars_of_goods if product_category is "manufactured"
    // Note: getDefaultParticulars is defined in the component, so we inline it here
    if (product.product_category?.toLowerCase() === "manufactured") {
      setParticularsOfGoods(getDefaultParticulars());
    } else {
      setParticularsOfGoods(null);
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
    const updatedUserType = userType.filter((_, i) => i !== idx);

    setFormData({
      ...formData,
      products: updatedProducts,
    });

    setErrors({
      ...errors,
      products: updatedErrors,
    });

    setUserType(updatedUserType);
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
      trade_region: formData.trade_region,
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
        userType={userType}
        particularsOfGoods={particularsOfGoods}
        originCriterions={originCriterions}
      />

      <HSCodeWidget open={open} onClose={() => setOpen(false)} />

      <form
        className="flex flex-col w-full mt-5 mb-15 flex-1 overflow-hidden"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-y-auto pr-3 pb-6 flex-1">
          {/* Contact Details Section */}
          <div className="space-y-2 border-b border-gray-200 pb-4">
            <div className="text-base text-md font-semibold text-gray-600">
              Contact Details
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex flex-col flex-1">
                <label className="text-sm text-gray-600 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="Enter contact person name"
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
                  Contact Person Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter contact person phone"
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
                  Contact Person Email
                </label>
                <input
                  type="email"
                  placeholder="Enter contact person email"
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
          </div>

          {/* Header with Title and Date Picker */}
          <div className="flex flex-col lg:flex-col justify-center lg:items-start border-b border-gray-200 pb-4 gap-2 lg:gap-6">
            <div className="text-base text-md font-semibold text-gray-600">
              Select the expected inspection date
            </div>
            <div className="flex flex-col items-start sm:items-start gap-2 w-full">
              <div className="text-sm text-gray-600">
                Expected Inspection Date
              </div>
              <DatePicker
                value={formData.expected_inspection_date}
                onChange={handleDateChange}
                error={errors.expected_inspection_date}
                placeholder="Select date"
                className="w-full py-5 sm:py-5 cursor-pointer"
              />
              {errors.expected_inspection_date && (
                <p className="text-red-500 text-xs">
                  {errors.expected_inspection_date}
                </p>
              )}
            </div>
          </div>

          {/* Trade Region Section */}
          <div className="space-y-2 border-b border-gray-200 pb-4">
            <div className="text-base text-md font-semibold text-gray-600">
              Trade Region
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-gray-600">
                Select trade region (where product will be shipped/traded){" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.trade_region ? String(formData.trade_region) : ""}
                onValueChange={(value) => {
                  const id = value ? Number(value) : null;
                  setFormData({ ...formData, trade_region: Number.isFinite(id as number) ? (id as number) : null });
                  if (errors.trade_region) {
                    setErrors({ ...errors, trade_region: undefined });
                  }
                }}
                disabled={originCriterionsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      originCriterionsLoading
                        ? "Loading trade regions..."
                        : "Select trade region"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {originCriterions.map((o) => (
                      <SelectItem key={String(o.id)} value={String(o.id)}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {(originCriterionsError || errors.trade_region) && (
                <p className="text-red-500 text-xs">
                  {errors.trade_region || originCriterionsError}
                </p>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="text-md font-semibold text-gray-700 mb-2">
            Products to be Verified
          </div>

          {formData.products.map((product, idx) => (
            <div
              className="flex flex-col gap-3 relative border border-gray-200 rounded-lg p-4 bg-gray-50"
              key={idx}
            >
              {/* Exporter/Manufacturer Selection and Manufacturer Input */}
              <div className="flex flex-col gap-3 mb-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-gray-700">
                    I am a: <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={userType[idx] || ""}
                    onValueChange={(value) => {
                      const newUserType = [...userType];
                      newUserType[idx] = value as "exporter" | "manufacturer" | "";
                      setUserType(newUserType);
                      // Clear manufacturer fields when switching to manufacturer
                      if (value === "manufacturer") {
                        handleInputChange(idx, "manufacturer", "");
                        // Directly update formData to clear manufacturer_id (since handleInputChange doesn't accept undefined)
                        const updatedFormData = { ...formData };
                        updatedFormData.products[idx] = {
                          ...updatedFormData.products[idx],
                          manufacturer_id: undefined,
                        };
                        setFormData(updatedFormData);
                      }
                      // Clear error when user selects an option
                      if (errors.products[idx]?.userType) {
                        const newErrors = { ...errors };
                        newErrors.products[idx] = { ...newErrors.products[idx] };
                        delete newErrors.products[idx].userType;
                        setErrors(newErrors);
                      }
                    }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exporter" id={`exporter-${idx}`} />
                      <Label
                        htmlFor={`exporter-${idx}`}
                        className="text-sm text-gray-700 cursor-pointer font-normal"
                      >
                        Exporter
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id={`manufacturer-${idx}`} />
                      <Label
                        htmlFor={`manufacturer-${idx}`}
                        className="text-sm text-gray-700 cursor-pointer font-normal"
                      >
                        Manufacturer
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.products[idx]?.userType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.products[idx]?.userType}
                    </p>
                  )}
                </div>
                {userType[idx] === "exporter" && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm text-gray-600">
                      Manufacturer <span className="text-red-500">*</span>
                    </Label>
                <ManufacturerAutocomplete
                  value={product.manufacturer || ""}
                      onChange={(value) => {
                        handleInputChange(idx, "manufacturer", value);
                        // Clear error when user starts typing
                        if (errors.products[idx]?.manufacturer) {
                          const newErrors = { ...errors };
                          newErrors.products[idx] = { ...newErrors.products[idx] };
                          delete newErrors.products[idx].manufacturer;
                          setErrors(newErrors);
                        }
                      }}
                  onSelect={(manufacturer) => {
                    handleInputChange(
                      idx,
                      "manufacturer",
                      manufacturer.company_name
                    );
                    handleInputChange(idx, "manufacturer_id", manufacturer.id);
                        // Clear error when manufacturer is selected
                        if (errors.products[idx]?.manufacturer) {
                          const newErrors = { ...errors };
                          newErrors.products[idx] = { ...newErrors.products[idx] };
                          delete newErrors.products[idx].manufacturer;
                          setErrors(newErrors);
                        }
                  }}
                  placeholder="Search manufacturer..."
                      error={errors.products[idx]?.manufacturer}
                    />
                    {errors.products[idx]?.manufacturer && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.products[idx]?.manufacturer}
                      </p>
                    )}
                  </div>
                )}
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

              {/* Particulars of Goods Form - Only show for manufactured products */}
              {product.product_category?.toLowerCase() === "manufactured" && (
                <div className="flex flex-col w-full mt-4 border-t border-gray-300 pt-4">
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    PART A
                  </div>
                  <div className="text-base font-semibold text-gray-700 mb-2">
                    Particulars of the Goods in Respect of which Evidence of Origin is required
                  </div>
                  <div className="text-sm text-gray-600 mb-4 italic bg-blue-50 p-3 rounded-md border border-blue-200">
                    These fields should be filled during the inspection phase. They are not mandatory for submitting the application, but are recommended to be completed before finalizing the verification.
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Production process(es) carried out <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Describe the production process(es) carried out"
                        rows={3}
                        value={particularsOfGoods?.production_process || ""}
                        onChange={(e) => updateParticulars("production_process", e.target.value)}
                        className={`w-full border text-sm ${
                          errors.particularsOfGoods?.production_process
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                      />
                      {errors.particularsOfGoods?.production_process && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.production_process}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Materials imported from outside the Partner State used in the manufacture of the goods described in the Certificate, their respective customs values and HS Codes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="List materials imported from outside the Partner State, their customs values and HS Codes"
                        rows={3}
                        value={particularsOfGoods?.materials_imported || ""}
                        onChange={(e) => updateParticulars("materials_imported", e.target.value)}
                        className={`w-full border text-sm ${
                          errors.particularsOfGoods?.materials_imported
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                      />
                      {errors.particularsOfGoods?.materials_imported && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.materials_imported}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Materials of East African Community origin used in the manufacture of the goods described in the Certificate, the respective custom value and HS Codes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="List materials of EAC origin, their customs values and HS Codes"
                        rows={3}
                        value={particularsOfGoods?.materials_eac_origin || ""}
                        onChange={(e) => updateParticulars("materials_eac_origin", e.target.value)}
                        className={`w-full border text-sm ${
                          errors.particularsOfGoods?.materials_eac_origin
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                      />
                      {errors.particularsOfGoods?.materials_eac_origin && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.materials_eac_origin}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Containers or other forms of interior packing normally sold with the goods at retail level or the materials used in their manufacture, their origin, customs values and HS Codes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Describe containers or interior packing, their origin, customs values and HS Codes"
                        rows={3}
                        value={particularsOfGoods?.containers_packing || ""}
                        onChange={(e) => updateParticulars("containers_packing", e.target.value)}
                        className={`w-full border text-sm ${
                          errors.particularsOfGoods?.containers_packing
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                      />
                      {errors.particularsOfGoods?.containers_packing && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.containers_packing}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Import duty, if any, paid on the materials imported from outside the Partner State <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Details of import duties paid on materials imported from outside the Partner State"
                        rows={2}
                        value={particularsOfGoods?.import_duty_paid || ""}
                        onChange={(e) => updateParticulars("import_duty_paid", e.target.value)}
                        className={`w-full border text-sm ${
                          errors.particularsOfGoods?.import_duty_paid
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                      />
                      {errors.particularsOfGoods?.import_duty_paid && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.import_duty_paid}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Direct labour costs and factory overheads <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter direct labour costs and factory overheads"
                        value={particularsOfGoods?.direct_labour_costs || ""}
                        onChange={(e) => updateParticulars("direct_labour_costs", e.target.value)}
                        className={`w-full px-3 py-2 border text-sm ${
                          errors.particularsOfGoods?.direct_labour_costs
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                      />
                      {errors.particularsOfGoods?.direct_labour_costs && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.direct_labour_costs}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Ex-factory costs of the goods produced <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter ex-factory costs"
                        value={particularsOfGoods?.ex_factory_costs || ""}
                        onChange={(e) => updateParticulars("ex_factory_costs", e.target.value)}
                        className={`w-full px-3 py-2 border text-sm ${
                          errors.particularsOfGoods?.ex_factory_costs
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                      />
                      {errors.particularsOfGoods?.ex_factory_costs && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.ex_factory_costs}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        The cost of exterior packing <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter cost of exterior packing"
                        value={particularsOfGoods?.exterior_packing_cost || ""}
                        onChange={(e) => updateParticulars("exterior_packing_cost", e.target.value)}
                        className={`w-full px-3 py-2 border text-sm ${
                          errors.particularsOfGoods?.exterior_packing_cost
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                      />
                      {errors.particularsOfGoods?.exterior_packing_cost && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.exterior_packing_cost}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        Profit mark-up on the goods produced <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter profit mark-up"
                        value={particularsOfGoods?.profit_markup || ""}
                        onChange={(e) => updateParticulars("profit_markup", e.target.value)}
                        className={`w-full px-3 py-2 border text-sm ${
                          errors.particularsOfGoods?.profit_markup
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                      />
                      {errors.particularsOfGoods?.profit_markup && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.profit_markup}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm text-gray-700 mb-1 font-medium">
                        The wholesale price of the goods in the country of manufacture <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter wholesale price"
                        value={particularsOfGoods?.wholesale_price || ""}
                        onChange={(e) => updateParticulars("wholesale_price", e.target.value)}
                        className={`w-full px-3 py-2 border text-sm ${
                          errors.particularsOfGoods?.wholesale_price
                            ? "border-red-500"
                            : "border-zinc-300"
                        } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                      />
                      {errors.particularsOfGoods?.wholesale_price && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.particularsOfGoods.wholesale_price}
                        </p>
                      )}
                    </div>

                    {/* Declaration Section */}
                    <div className="flex flex-col sm:col-span-2 mt-4 pt-4 border-t border-gray-300">
                      <div className="text-base font-semibold text-gray-700 mb-4">
                        Declaration
                      </div>
                      <div className="text-sm text-gray-600 mb-4 italic">
                        Declare that the above details and statements are correct and that they are furnished in cognizance of the requirements of the Rules of Origin.
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Name and Designation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter name and designation"
                            value={particularsOfGoods?.declaration_name_designation || ""}
                            onChange={(e) => updateParticulars("declaration_name_designation", e.target.value)}
                            className={`w-full px-3 py-2 border text-sm ${
                              errors.particularsOfGoods?.declaration_name_designation
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                          />
                          {errors.particularsOfGoods?.declaration_name_designation && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.declaration_name_designation}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Name of the Firm <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter firm name"
                            value={particularsOfGoods?.declaration_firm_name || ""}
                            onChange={(e) => updateParticulars("declaration_firm_name", e.target.value)}
                            className={`w-full px-3 py-2 border text-sm ${
                              errors.particularsOfGoods?.declaration_firm_name
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                          />
                          {errors.particularsOfGoods?.declaration_firm_name && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.declaration_firm_name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Physical Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter physical location"
                            value={particularsOfGoods?.declaration_physical_location || ""}
                            onChange={(e) => updateParticulars("declaration_physical_location", e.target.value)}
                            className={`w-full px-3 py-2 border text-sm ${
                              errors.particularsOfGoods?.declaration_physical_location
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                          />
                          {errors.particularsOfGoods?.declaration_physical_location && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.declaration_physical_location}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            placeholder="Enter address"
                            rows={2}
                            value={particularsOfGoods?.declaration_address || ""}
                            onChange={(e) => updateParticulars("declaration_address", e.target.value)}
                            className={`w-full border text-sm ${
                              errors.particularsOfGoods?.declaration_address
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
                          />
                          {errors.particularsOfGoods?.declaration_address && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.declaration_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PART B - Certification Section */}
                    <div className="flex flex-col sm:col-span-2 mt-4 pt-4 border-t border-gray-300">
                      <div className="text-base font-semibold text-gray-700 mb-2">
                        PART B – Certification
                      </div>
                      <div className="text-sm text-gray-600 mb-4 italic">
                        It is hereby certified, on the basis of control carried out that the declaration by the exporter is correct.
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Place and Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter place and date"
                            value={particularsOfGoods?.certification_place_date || ""}
                            onChange={(e) => updateParticulars("certification_place_date", e.target.value)}
                            className={`w-full px-3 py-2 border text-sm ${
                              errors.particularsOfGoods?.certification_place_date
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                          />
                          {errors.particularsOfGoods?.certification_place_date && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.certification_place_date}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm text-gray-700 mb-1 font-medium">
                            Name and Signature <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter name and signature"
                            value={particularsOfGoods?.certification_name_signature || ""}
                            onChange={(e) => updateParticulars("certification_name_signature", e.target.value)}
                            className={`w-full px-3 py-2 border text-sm ${
                              errors.particularsOfGoods?.certification_name_signature
                                ? "border-red-500"
                                : "border-zinc-300"
                            } bg-white focus:outline-none rounded-md placeholder:text-zinc-400 text-zinc-500`}
                          />
                          {errors.particularsOfGoods?.certification_name_signature && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.particularsOfGoods.certification_name_signature}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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


          <div className="w-full flex items-center justify-center sm:justify-end mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-blue-500 text-white rounded-[7px] hover:bg-blue-600 cursor-pointer text-base font-medium"
            >
              Submit Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
