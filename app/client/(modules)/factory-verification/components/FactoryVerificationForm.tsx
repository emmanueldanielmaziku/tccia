"use client";
import { useState } from "react";
import { z } from "zod";
import { TextBlock, TextalignJustifyleft, Add, CloseCircle } from "iconsax-reactjs";

// Zod schema for validation
const productSchema = z.object({
  productname: z.string().min(1, "Product name is required"),
  productdesc: z
    .string()
    .min(1, "Product description is required")
    .max(100, "Product description is too long"),
});

const factoryVerificationSchema = z.object({
  products: z.array(productSchema).min(1, "At least one product is required"),
});

// Preview Widget Component
function PreviewWidget({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: { productname: string; productdesc: string }[];
}) {
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
              className="cursor-pointer hover:bg-blue-600 flex flex-row justify-center items-center gap-2 text-sm text-blue-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px]  border-blue-600 transition-colors"
              aria-label="Close preview"
            >
              Edit Application
            </button>
          </div>

          {/* Request Info */}
          <div className="mb-6 flex flex-col gap-1 text-sm text-gray-700">
             <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Company name:</span> ABC Corp
            </div>
             <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Issued by:</span> Emmanuel
              Daniel
            </div>
             <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Submission Date:</span>
              {new Date().toLocaleDateString()}
            </div>
             <div className="flex items-center gap-2 text-gray-600">
              <h2 className="text-lg font-semibold text-gray-800">Products</h2>
            </div>
          </div>
        </div>

        {/* Products Preview */}
        <div className="mb-4 overflow-y-auto h-[600px] pr-3">
          <div className="flex flex-col gap-4">
            {products.map((product, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-gray-700">
                    {product.productname}
                  </span>
                </div>
                <div className="text-gray-600 text-sm whitespace-pre-line">
                  {product.productdesc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FactoryVerificationForm() {
  // State for form inputs (array of products)
  const [formData, setFormData] = useState([
    { productname: "", productdesc: "" },
  ]);

  // State for errors (array of error objects)
  const [errors, setErrors] = useState<
    { productname?: string; productdesc?: string }[]
  >([{}]);

  const [previewState, togglePreview] = useState(false);
  const [previewData, setPreviewData] = useState<
    { productname: string; productdesc: string }[]
  >([]);

  // Handle form submission (for preview)
  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate form data using Zod
    const result = factoryVerificationSchema.safeParse({ products: formData });

    if (!result.success) {
    if (!result.success) {
      // Extract errors and set them in state
      const productErrors: { productname?: string; productdesc?: string }[] = [];
      // Zod error format: { path: ['products', idx, field], message }
      result.error.errors.forEach((err) => {
        if (
          Array.isArray(err.path) &&
          err.path.length === 3 &&
          err.path[0] === "products"
        ) {
          const idx = err.path[1] as number;
          const field = err.path[2] as "productname" | "productdesc";
          if (!productErrors[idx]) productErrors[idx] = {};
          productErrors[idx][field] = err.message;
        }
      });
      setErrors(formData.map((_, idx) => productErrors[idx] || {}));
      return;
    }
      setErrors(formData.map((product) => ({
        productname: !product.productname ? "Product name is required" : undefined,
        productdesc: !product.productdesc ? "Product description is required" : undefined,
      })));
      return;

    }

    setErrors(formData.map(() => ({})));
    setPreviewData(formData);
    togglePreview(true);
  };

  // Handle input change for a specific product
  const handleInputChange = (
    idx: number,
    field: "productname" | "productdesc",
    value: string
  ) => {
    const updatedFormData = [...formData];
    updatedFormData[idx][field] = value;
    setFormData(updatedFormData);

    // Clear error for this field
    const updatedErrors = [...errors];
    if (updatedErrors[idx]) {
      updatedErrors[idx][field] = undefined;
      setErrors(updatedErrors);
    }
  };

  // Add new product fields
  const handleAddProduct = () => {
    setFormData([...formData, { productname: "", productdesc: "" }]);
    setErrors([...errors, {}]);
  };

  // Remove product fields
  const handleRemoveProduct = (idx: number) => {
    if (formData.length === 1) return;
    setFormData(formData.filter((_, i) => i !== idx));
    setErrors(errors.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Preview Widget */}
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        products={previewData}
      />
      {/* End of Preview Widget */}
      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto h-[700px] pr-3">
          {formData.map((product, idx) => (
            <div
              className="flex flex-row gap-6 relative border-t-[0.5px] border-dashed border-gray-400 pt-8"
              key={idx}
            >
              {/* Product Name Input */}
              <div className="relative w-[40%]">
                <div className="text-sm py-2 w-full">Product Name</div>
                <input
                  type="text"
                  placeholder="Enter product name..."
                  value={product.productname}
                  onChange={(e) =>
                    handleInputChange(idx, "productname", e.target.value)
                  }
                  className={`w-full px-6 py-3.5 pr-12 border ${
                    errors[idx]?.productname
                      ? "border-red-500"
                      : "border-zinc-300"
                  } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
                />
                <TextBlock
                  size="22"
                  color="#9F9FA9"
                  className="absolute top-13 right-5"
                />
                {errors[idx]?.productname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[idx]?.productname}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col flex-1/2 w-[50%]">
                <div className="text-sm py-2 w-full">Product Description</div>
                <textarea
                  placeholder="Brief description of the product to be verified..."
                  rows={4}
                  value={product.productdesc}
                  onChange={(e) =>
                    handleInputChange(idx, "productdesc", e.target.value)
                  }
                  className={`w-full relative border ${
                    errors[idx]?.productdesc
                      ? "border-red-500"
                      : "border-zinc-300"
                  } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px] pr-10 pl-4 py-4 resize-none`}
                ></textarea>
                <TextalignJustifyleft
                  size="22"
                  color="#9F9FA9"
                  className="absolute top-20 right-5"
                />
                {errors[idx]?.productdesc && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[idx]?.productdesc}
                  </p>
                )}
              </div>

              {/* Remove field icon */}
              {formData.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(idx)}
                  className="flex flex-row cursor-pointer underline justify-center items-center absolute top-10 gap-3 right-[5px] text-red-500 text-sm hover:text-red-700"
                  aria-label="Remove product"
                >
                  <span>Remove</span>
                  <CloseCircle size={18} color="#ef4444" />
                </button>
              )}
            </div>
          ))}

          <div>
            <button
              type="button"
              onClick={handleAddProduct}
              className="flex flex-row justify-center items-center gap-3 cursor-pointer border-[0.5px] border-dotted py-3 text-gray-500 bg-gray-100 hover:bg-gray-200 border-gray-500 rounded-md w-full"
            >
              <Add size={25} color="gray" />
              Add another product
            </button>
          </div>
        </div>

        <div className="w-full flex items-center justify-end">
          <button
            type="submit"
            className="px-12 py-2 mt-4 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}
