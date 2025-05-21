"use client";
import { useState } from "react";
import { z } from "zod";
import { TextBlock } from "iconsax-reactjs";

// Zod schema for validation
const companySchema = z.object({
  companyTin: z.string().min(6, "Company TIN is Invalid"),
});

function PreviewWidget({
  open,
  onClose,
  companyTin,
}: {
  open: boolean;
  onClose: () => void;
  companyTin: string;
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
                Company Registration Preview
              </h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-red-600 flex flex-row justify-center items-center gap-2 text-sm text-red-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px]  border-red-600 transition-colors"
              aria-label="Close preview"
            >
              Reject
            </button>
          </div>

          {/* Request Info */}
          <div className="mb-6 flex flex-col gap-1 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">Company TIN:</span>{" "}
              {companyTin}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium text-gray-700">
                Submission Date:
              </span>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-800 transition-colors cursor-pointer"
          >
            Comfirm Registration
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FirmRegForm() {
  // State for form input
  const [companyTin, setCompanyTin] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const [previewState, togglePreview] = useState(false);

  // Handle form submission (for preview)
  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate form data using Zod
    const result = companySchema.safeParse({ companyTin });

    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }

    setError(undefined);
    togglePreview(true);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setCompanyTin(value);
    setError(undefined);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Preview Widget */}
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        companyTin={companyTin}
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
            className="px-12 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer"
          >
            Submit Tin Number
          </button>
        </div>
      </form>
    </div>
  );
}
