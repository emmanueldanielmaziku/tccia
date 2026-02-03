"use client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Sms, Call, User, Building, Layer, Verify, Chart } from "iconsax-reactjs";
import { Checkbox } from "@/components/ui/checkbox";

const userSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type CompanyData = {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code?: string;
};

type Module = { id: number; name: string; code: string };
type Permission = { id: number; name: string; code: string };

type PreviewWidgetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  user: {
    name: string;
    email: string;
    phone: string;
    company: CompanyData | null;
    modules: Array<{
      module_id: number;
      module_name: string;
      permissions: string[];
    }>;
  };
};

const PreviewWidget: React.FC<PreviewWidgetProps> = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
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
              {user.name}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Sms size={18} color="#666" />
              <span className="font-medium text-gray-700">Email:</span>
              {user.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Call size={18} color="#666" />
              <span className="font-medium text-gray-700">Phone:</span>
              {user.phone || "-"}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Building size={18} color="#666" />
              <span className="font-medium text-gray-700">Company:</span>
            </div>
            <div className="ml-8 text-sm text-gray-700">
              {user.company ? (
                <div className="flex flex-col">
                  <span className="font-medium">{user.company.company_name}</span>
                  <span className="text-xs text-blue-700">{user.company.company_tin}</span>
                </div>
              ) : (
                <span className="text-gray-500">No company selected</span>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Layer size={18} color="#666" />
                <span className="font-medium text-gray-700">Module Access:</span>
              </div>
              {user.modules.length === 0 ? (
                <div className="ml-8 text-sm text-gray-500">No module permissions selected</div>
              ) : (
                <ul className="ml-8 list-disc">
                  {user.modules.map((m) => (
                    <li key={m.module_id}>
                      <span className="font-medium">{m.module_name}</span>{" "}
                      <span className="text-xs text-gray-500">
                        ({m.permissions.join(", ")})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Employee"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AddOfficerForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State for form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // State for errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({
  });

  const [previewState, togglePreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // module_id -> set(permission_code)
  const [modulePerms, setModulePerms] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true);
      setSubmitError(null);
      try {
        const stored = localStorage.getItem("selectedCompany");
        if (stored) setCompany(JSON.parse(stored));

        const [modsRes, permsRes] = await Promise.all([
          fetch("/api/modules"),
          fetch("/api/permissions"),
        ]);
        const modsJson = await modsRes.json();
        const permsJson = await permsRes.json();

        setModules(Array.isArray(modsJson?.modules) ? modsJson.modules : []);
        setPermissions(
          Array.isArray(permsJson?.permissions) ? permsJson.permissions : []
        );
      } catch (e) {
        setSubmitError("Failed to load modules/permissions.");
      } finally {
        setLoadingMeta(false);
      }
    };

    load();

    const handleCompanyChange = () => {
      const updated = localStorage.getItem("selectedCompany");
      if (updated) setCompany(JSON.parse(updated));
    };
    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
    window.addEventListener("storage", handleCompanyChange);
    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
      window.removeEventListener("storage", handleCompanyChange);
    };
  }, []);

  const selectedModulesPayload = useMemo(() => {
    return Object.entries(modulePerms)
      .map(([moduleId, perms]) => ({
        module_id: Number(moduleId),
        permissions: perms,
      }))
      .filter((m) => m.permissions.length > 0);
  }, [modulePerms]);

  const previewModules = useMemo(() => {
    return selectedModulesPayload.map((m) => {
      const mod = modules.find((x) => x.id === m.module_id);
      return {
        module_id: m.module_id,
        module_name: mod?.name || `Module ${m.module_id}`,
        permissions: m.permissions,
      };
    });
  }, [modules, selectedModulesPayload]);

  const togglePermission = (moduleId: number, permCode: string) => {
    setModulePerms((prev) => {
      const current = new Set(prev[moduleId] || []);
      if (current.has(permCode)) current.delete(permCode);
      else current.add(permCode);
      return { ...prev, [moduleId]: Array.from(current) };
    });
  };

  // Handle form submission (for preview)
  const handlePreview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const result = userSchema.safeParse({
      ...formData,
    });

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (Array.isArray(err.path)) {
          if (err.path.length === 1) {
            const field = err.path[0] as keyof typeof errors;
            (fieldErrors as any)[field] = err.message;
          }
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setPreviewData({
      ...formData,
      company,
      modules: previewModules,
    });
    togglePreview(true);
  };

  const handleInputChange = (
    field: "name" | "email" | "phone",
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!company?.id) {
      setSubmitError("No company selected. Please select a company first.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        company_id: company.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        modules: selectedModulesPayload.length ? selectedModulesPayload : undefined,
      };

      const res = await fetch("/api/manager/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error || "Failed to add employee.");
        return;
      }
      togglePreview(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      setSubmitError("Network error while adding employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <PreviewWidget
        open={previewState}
        onClose={() => togglePreview(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        user={
          previewData || {
            ...formData,
            company,
            modules: previewModules,
          }
        }
      />

      <form
        className="flex flex-col w-full pb-10 mt-5"
        onSubmit={handlePreview}
      >
        <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto max-h-[700px] pr-3">
          {/* Full Name */}
          <div className="relative w-full">
            <div className="text-sm py-2 w-full">Full Name</div>
            <input
              type="text"
              placeholder="Enter full name..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-6 py-3.5 pr-12 border ${
                errors.name ? "border-red-500" : "border-zinc-300"
              } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
            />
            <User
              size="22"
              color="#9F9FA9"
              className="absolute top-13 right-5"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
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
          {/* Company */}
          <div>
            <div className="text-sm py-2 w-full">Company</div>
            <div className="w-full border border-zinc-200 bg-white rounded-[8px] px-4 py-3 text-sm text-gray-700">
              {company ? (
                <div className="flex flex-col">
                  <span className="font-medium">{company.company_name}</span>
                  <span className="text-xs text-blue-700">{company.company_tin}</span>
                </div>
              ) : (
                <span className="text-gray-500">
                  No company selected. Use the Company Picker on the right panel.
                </span>
              )}
            </div>
          </div>

          {/* Module permissions */}
          <div>
            <div className="text-sm py-2 w-full flex items-center gap-2">
              <Chart size={18} color="#6B7280" />
              Module Access
            </div>
            {loadingMeta ? (
              <div className="text-sm text-gray-500">Loading modules and permissions...</div>
            ) : modules.length === 0 ? (
              <div className="text-sm text-gray-500">No modules available.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {modules.map((m) => (
                  <div
                    key={m.id}
                    className="border border-zinc-200 rounded-[10px] bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800 text-sm">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.code}</div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {permissions.map((p) => (
                        <div key={`${m.id}-${p.id}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`m-${m.id}-p-${p.id}`}
                            checked={(modulePerms[m.id] || []).includes(p.code)}
                            onCheckedChange={() => togglePermission(m.id, p.code)}
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`m-${m.id}-p-${p.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {p.name}
                            <span className="text-xs text-gray-500 ml-2">({p.code})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {submitError && (
          <div className="text-sm text-red-500 mt-3">{submitError}</div>
        )}
        <div className="w-full flex items-center justify-end">
          <button
            type="submit"
            disabled={!company || submitting}
            className="px-12 py-2 mt-4 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  );
}
