"use client";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  TextalignJustifyleft,
  Add,
  CloseCircle,
  SearchNormal1,
} from "iconsax-reactjs";
import { DatePicker } from "@/components/ui/date-picker";

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
}

interface FormData {
  products: FormProduct[];
  expected_inspection_date: string;
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
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: Product) => void;
  error?: string;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products/list", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.status === "success" && data.data?.products) {
          setProducts(data.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [value, products]);

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
    onChange(product.name);
    onSelect(product);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() =>
            value.trim() !== "" && setShowSuggestions(suggestions.length > 0)
          }
          className={`w-full px-6 py-2 pr-12 border ${
            error ? "border-red-500" : "border-zinc-300"
          } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
        />
        <SearchNormal1
          size="20"
          color="#9F9FA9"
          className="absolute top-3 right-5"
        />
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((product, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="font-medium text-gray-700">{product.name}</div>
                <div className="text-sm text-gray-500">
                  HS: {product.hs_code} | {product.product_category} |{" "}
                  {product.unity_of_measure}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No products found</div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewWidget({
  open,
  onClose,
  formData,
}: {
  open: boolean;
  onClose: () => void;
  formData: FormData;
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

      const response = await fetch("/api/factory-verification/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, company_tin }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setSubmitSuccess(true);

        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
        }, 3000);
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
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
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
      <div className="relative w-4xl h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl p-8 animate-fadeIn">
        {/* Close Button */}
        <div>
          <div className="flex flex-row justify-between items-center border-b border-gray-300 pb-4 mb-4">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-1">
                Product Verification Request Preview
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer hover:bg-blue-600 flex flex-row justify-center items-center gap-2 text-sm text-blue-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px]  border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close preview"
            >
              Edit Application
            </button>
          </div>

          {/* Request Info */}
          <div className="mb-6 flex flex-col gap-1 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Company name:</span>{" "}
              ABC Corp
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Issued by:</span>{" "}
              Emmanuel Daniel
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">
                Submission Date:
              </span>
              {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">
                Expected Inspection Date:
              </span>
              {formData.expected_inspection_date
                ? new Date(
                    formData.expected_inspection_date
                  ).toLocaleDateString()
                : "Not specified"}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
            </div>
          </div>
        </div>

        {/* Products Preview */}
        <div className="mb-4 overflow-y-auto h-[600px] pr-3">
          <div className="flex flex-col gap-4">
            {formData.products.map((product, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-gray-700">
                    {product.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-medium">HS Code:</span>{" "}
                    {product.hs_code}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {product.product_category}
                  </div>
                  <div>
                    <span className="font-medium">Unity:</span>{" "}
                    {product.unity_of_measure}
                  </div>
                  <div>
                    <span className="font-medium">Company ID:</span>{" "}
                    {product.company_id}
                  </div>
                </div>
                <div className="text-gray-600 text-sm whitespace-pre-line">
                  <span className="font-medium">Description:</span>{" "}
                  {product.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FactoryVerificationForm() {
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
      },
    ],
    expected_inspection_date: "",
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
  }>({
    products: [{}],
    expected_inspection_date: undefined,
  });

  const [previewState, togglePreview] = useState(false);

  // Helper function to validate individual product
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

  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

 
    const newErrors: {
      products: {
        name?: string;
        hs_code?: string;
        description?: string;
        product_category?: string;
        unity_of_measure?: string;
      }[];
      expected_inspection_date?: string;
    } = {
      products: formData.products.map((product, index) =>
        validateProduct(product, index)
      ),
      expected_inspection_date: undefined,
    };

  
    if (!formData.expected_inspection_date.trim()) {
      newErrors.expected_inspection_date =
        "Expected inspection date is required";
    }

 
    const hasErrors =
      newErrors.expected_inspection_date ||
      newErrors.products.some(
        (productErrors) => Object.keys(productErrors).length > 0
      );

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

 
    setErrors({
      products: formData.products.map(() => ({})),
      expected_inspection_date: undefined,
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
    if (field === "company_id" || field === "manager_id") {
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

    // Clear errors for the fields that were auto-filled
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

  // Ensure form data is always valid before submission
  const getValidFormData = (): FormData => {
    return {
      products: formData.products.map((product) => ({
        product_id: product.product_id || 1,
        name: product.name.trim(),
        hs_code: product.hs_code.trim(),
        description: product.description.trim(),
        company_id: product.company_id,
        product_category: product.product_category.trim(),
        unity_of_measure: product.unity_of_measure.trim(),
        manager_id: product.manager_id,
      })),
      expected_inspection_date: formData.expected_inspection_date.trim(),
    };
  };

  // Function to ensure all required fields are filled
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
      />

      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto h-[700px] pr-3">
          {/* Header with Date Picker */}
          <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-4">
            <div className="text-lg font-semibold text-gray-700">
              Factory Verification Application
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-gray-600">
                Expected Inspection Date
              </div>
              <DatePicker
                value={formData.expected_inspection_date}
                onChange={handleDateChange}
                error={errors.expected_inspection_date}
                placeholder="Select date"
                className="w-full py-4"
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
              <div className="relative w-full">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </div>
                <ProductAutocomplete
                  value={product.name}
                  onChange={(value) => handleInputChange(idx, "name", value)}
                  onSelect={(selectedProduct) =>
                    handleProductSelect(idx, selectedProduct)
                  }
                  error={errors.products[idx]?.name}
                  placeholder="Start typing to search products..."
                />
                {errors.products[idx]?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.products[idx]?.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HS Code
                  </div>
                  <input
                    type="text"
                    placeholder="HS Code"
                    value={product.hs_code}
                    onChange={(e) =>
                      handleInputChange(idx, "hs_code", e.target.value)
                    }
                    className={`w-full px-3 py-2 border text-sm ${
                      errors.products[idx]?.hs_code
                        ? "border-red-500"
                        : "border-zinc-300"
                    } bg-white outline-blue-400 rounded-md placeholder:text-zinc-400 text-zinc-500`}
                    readOnly
                  />
                  {errors.products[idx]?.hs_code && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[idx]?.hs_code}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-700 mb-1">
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
                    } bg-white outline-blue-400 rounded-md placeholder:text-zinc-400 text-zinc-500`}
                    readOnly
                  />
                  {errors.products[idx]?.product_category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.products[idx]?.product_category}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-700 mb-1">
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
                    } bg-white outline-blue-400 rounded-md placeholder:text-zinc-400 text-zinc-500`}
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
                <div className="text-sm font-medium text-gray-700 mb-1">
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
                  } bg-white outline-blue-400 rounded-md placeholder:text-zinc-400 text-zinc-500 px-3 py-2 resize-none`}
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
                  className="flex flex-row cursor-pointer justify-center items-center gap-2 absolute top-2 right-2 text-red-500 text-xs hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                  aria-label="Remove product"
                >
                  <span>Remove</span>
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

        <div className="w-full flex items-center justify-end mt-4">
          <button
            type="submit"
            className="px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer text-sm font-medium"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}
