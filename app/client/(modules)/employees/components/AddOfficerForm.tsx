"use client";
import { useState } from "react";
import { z } from "zod";
import { Sms, Call, User, Building } from "iconsax-reactjs";
import { Checkbox } from "@/components/ui/checkbox";

// Zod schema for validation
const companySchema = z.object({
  companyname: z.string().min(1, "Company name is required"),
});

const userSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Second name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  companies: z.array(companySchema).min(1, "At least one company is required"),
});

const availableCompanies = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Globex Ltd" },
  { id: 3, name: "Umbrella Inc" },
  { id: 4, name: "Wayne Enterprises" },
];

type Company = { companyname: string };
type PreviewWidgetProps = {
  open: boolean;
  onClose: () => void;
  user: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    companies: Company[];
  };
};

const PreviewWidget: React.FC<PreviewWidgetProps> = ({
  open,
  onClose,
  user,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[3px] transition-opacity duration-300 opacity-100 pointer-events-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-2xl flex flex-col bg-white rounded-xl shadow-2xl p-8 animate-fadeIn">
        {/* Close Button */}
        <div>
          <div className="flex flex-row justify-between items-center border-b border-gray-300 pb-4 mb-4">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-1">
                Officer Preview
              </h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer hover:bg-blue-600 flex flex-row justify-center items-center gap-2 text-sm text-blue-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px] border-blue-600 transition-colors"
              aria-label="Close preview"
            >
              Edit
            </button>
          </div>

          {/* Officer Info */}
          <div className="mb-6 flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} color="#666" />
              <span className="font-medium text-gray-700">Name:</span>
              {user.firstname} {user.lastname}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Sms size={18} color="#666" />
              <span className="font-medium text-gray-700">Email:</span>
              {user.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Call size={18} color="#666" />
              <span className="font-medium text-gray-700">Phone:</span>
              {user.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Building size={18} color="#666" />
              <span className="font-medium text-gray-700">Companies:</span>
            </div>
            <ul className="ml-8 list-disc">
              {user.companies.map((c, idx) => (
                <li key={idx}>{c.companyname}</li>
              ))}
            </ul>
          </div>
        </div>
        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Officer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AddOfficerForm() {
  // State for form inputs
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    companyIds: [] as number[],
  });

  // State for errors
  const [errors, setErrors] = useState<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    companies: { companyname?: string }[];
  }>({
    companies: [{}],
  });

  const [previewState, togglePreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Handle form submission (for preview)
  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Map IDs to company objects for validation
    const companies = formData.companyIds.map((id) => ({
      companyname: availableCompanies.find((c) => c.id === id)?.name || "",
    }));

    const result = userSchema.safeParse({
      ...formData,
      companies,
    });

    if (!result.success) {
      const fieldErrors: typeof errors = { companies: [] };
      result.error.errors.forEach((err) => {
        if (Array.isArray(err.path)) {
          if (err.path[0] === "companies" && err.path.length === 3) {
            const idx = err.path[1] as number;
            const field = err.path[2] as "companyname";
            if (!fieldErrors.companies[idx]) fieldErrors.companies[idx] = {};
            fieldErrors.companies[idx][field] = err.message;
          } else if (err.path.length === 1) {
            const field = err.path[0] as keyof typeof errors;
            (fieldErrors as any)[field] = err.message;
          }
        }
      });
      fieldErrors.companies = companies.map(
        (_, idx) => fieldErrors.companies[idx] || {}
      );
      setErrors(fieldErrors);
      return;
    }

    setErrors({ companies: companies.map(() => ({})) });
    setPreviewData({ ...formData, companies });
    togglePreview(true);
  };

  const handleInputChange = (
    field: "firstname" | "lastname" | "email" | "phone",
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleCompanyCheckbox = (id: number) => {
    setFormData((prev) => {
      const alreadySelected = prev.companyIds.includes(id);
      const newCompanyIds = alreadySelected
        ? prev.companyIds.filter((cid) => cid !== id)
        : [...prev.companyIds, id];

      return {
        ...prev,
        companyIds: newCompanyIds,
      };
    });

    // Clear company errors when selection changes
    setErrors((prev) => ({
      ...prev,
      companies: formData.companyIds.length ? [] : [{}],
    }));
  };

  return (
    <div className="flex flex-col w-full h-full">
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        user={
          previewData || {
            ...formData,
            companies: formData.companyIds.map((id) => ({
              companyname:
                availableCompanies.find((c) => c.id === id)?.name || "",
            })),
          }
        }
      />

      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto max-h-[700px] pr-3">
          <div className="flex flex-row gap-4">
            {/* First Name */}
            <div className="relative w-full">
              <div className="text-sm py-2 w-full">First Name</div>
              <input
                type="text"
                placeholder="Enter first name..."
                value={formData.firstname}
                onChange={(e) => handleInputChange("firstname", e.target.value)}
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
            {/* Second Name */}
            <div className="relative w-full">
              <div className="text-sm py-2 w-full">Second Name</div>
              <input
                type="text"
                placeholder="Enter second name..."
                value={formData.lastname}
                onChange={(e) => handleInputChange("lastname", e.target.value)}
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
          {/* Email */}
          <div className="relative w-full">
            <div className="text-sm py-2 w-full">Email Address</div>
            <input
              type="email"
              placeholder="Enter email address..."
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
          {/* Phone */}
          <div className="relative w-full">
            <div className="text-sm py-2 w-full">Phone Number</div>
            <input
              type="tel"
              placeholder="Enter phone number..."
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
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
          {/* Companies */}
          <div>
            <div className="text-sm py-2 w-full">Assign Companies</div>
            <div className="flex flex-col gap-3">
              {availableCompanies.map((company) => (
                <div key={company.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`company-${company.id}`}
                    checked={formData.companyIds.includes(company.id)}
                          onCheckedChange={() => handleCompanyCheckbox(company.id)}
                          className="cursor-pointer"
                  />
                  <label
                    htmlFor={`company-${company.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {company.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.companies.length > 0 &&
              errors.companies.some((e) => e.companyname) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companies[0]?.companyname ||
                    "Please select at least one company"}
                </p>
              )}
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
