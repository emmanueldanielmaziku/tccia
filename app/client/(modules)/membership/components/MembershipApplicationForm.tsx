"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  User,
  Users,
  Building,
  Book,
} from "lucide-react";
import CategoryNotebookModal from "./CategoryNotebookModal";

interface Region {
  id: number;
  name: string;
  districts: District[];
}

interface District {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
}

interface Person {
  name: string;
  phone: string;
  email: string;
}

export default function MembershipApplicationForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  // Dropdown data
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [regionId, setRegionId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [sectorId, setSectorId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [directors, setDirectors] = useState<Person[]>([
    { name: "", phone: "", email: "" },
  ]);
  const [contacts, setContacts] = useState<Person[]>([
    { name: "", phone: "", email: "" },
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});

  // Track touched state for directors/contacts
  const [touchedDirectors, setTouchedDirectors] = useState(() => [
    { name: false, phone: false, email: false },
  ]);
  const [touchedContacts, setTouchedContacts] = useState(() => [
    { name: false, phone: false, email: false },
  ]);
  const [forceShowErrors, setForceShowErrors] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    fetch("/api/membership/regions")
      .then((res) => res.json())
      .then((data) => setRegions(data?.data?.regions || []));

    fetch("/api/membership/sectors")
      .then((res) => res.json())
      .then((data) => setSectors(data?.data?.sectors || []));

    fetch("/api/membership/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data?.data?.categories || []));
  }, []);

  // Filtered lists
  const selectedRegion = regions.find((r) => r.id === Number(regionId));
  const districts = selectedRegion?.districts || [];
  const selectedCategory = categories.find((c) => c.id === Number(categoryId));
  const subcategories = selectedCategory?.subcategories || [];

  // Handlers for dynamic fields
  const handleDirectorChange = (
    idx: number,
    field: keyof Person,
    value: string
  ) => {
    setDirectors((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
    setTouchedDirectors((prev) => {
      const arr = [...prev];
      if (!arr[idx]) arr[idx] = { name: false, phone: false, email: false };
      arr[idx][field] = true;
      return arr;
    });
  };

  const addDirector = () => {
    setDirectors((prev) => [...prev, { name: "", phone: "", email: "" }]);
    setTouchedDirectors((prev) => [
      ...prev,
      { name: false, phone: false, email: false },
    ]);
  };

  const removeDirector = (idx: number) => {
    setDirectors((prev) => prev.filter((_, i) => i !== idx));
    setTouchedDirectors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleContactChange = (
    idx: number,
    field: keyof Person,
    value: string
  ) => {
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
    setTouchedContacts((prev) => {
      const arr = [...prev];
      if (!arr[idx]) arr[idx] = { name: false, phone: false, email: false };
      arr[idx][field] = true;
      return arr;
    });
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { name: "", phone: "", email: "" }]);
    setTouchedContacts((prev) => [
      ...prev,
      { name: false, phone: false, email: false },
    ]);
  };

  const removeContact = (idx: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
    setTouchedContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  // Preview and submit
  const validateForm = () => {
    const errors: any = {};

    if (!regionId) errors.regionId = "Region is required.";
    if (!districtId) errors.districtId = "District is required.";
    if (!sectorId) errors.sectorId = "Sector is required.";
    if (!categoryId) errors.categoryId = "Category is required.";
    if (!subcategoryId) errors.subcategoryId = "Subcategory is required.";

    // Directors are now optional, so skip required validation
    errors.directors = directors.map((d: any) => {
      const e: any = {};
      // No required fields for directors
      return e;
    });

    errors.contacts = contacts.map((c: any) => {
      const e: any = {};
      if (!c.name) e.name = "Name required";
      if (!c.phone) e.phone = "Phone required";
      if (!c.email) e.email = "Email required";
      return e;
    });

    // Remove directorsGeneral required check
    if (contacts.length === 0)
      errors.contactsGeneral = "At least one contact required.";

    // Check if any errors
    const hasFieldError =
      Object.keys(errors).some(
        (k) => k !== "directors" && k !== "contacts" && errors[k]
      ) ||
      errors.directors.some((e: any) => Object.keys(e).length > 0) ||
      errors.contacts.some((e: any) => Object.keys(e).length > 0);

    return { errors, hasFieldError };
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setForceShowErrors(true);
    const { errors, hasFieldError } = validateForm();
    setFieldErrors(errors);

    if (hasFieldError) {
      setErrorMsg("Please fill all required fields correctly.");
      return;
    }

    setErrorMsg(null);
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Get company_tin from localStorage
      let company_tin = "";
      try {
        const stored = localStorage.getItem("selectedCompany");
        if (stored) {
          const parsed = JSON.parse(stored);
          company_tin = parsed.company_tin || "";
        }
      } catch {}

      if (!company_tin) {
        setErrorMsg("No company selected. Please select a company first.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_tin,
          category_id: Number(categoryId),
          subcategory_id: Number(subcategoryId),
          region_id: Number(regionId),
          district_id: Number(districtId),
          sector_id: Number(sectorId),
          directors,
          contacts,
        }),
      });

      const data = await res.json();

      if (data?.result?.success) {
        setSuccessMsg(
          `Application #${data.result.data.application_number} submitted! State: ${data.result.data.state}`
        );
        setShowPreview(false);
        setSubmitted(true);
        // Optionally reset form fields here
      } else {
        setErrorMsg(data?.result?.message || "Submission failed.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md font-medium text-sm mt-1">
      <AlertCircle size={16} className="text-red-400" />
      <span>{children}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <form onSubmit={handlePreview} className="flex flex-col w-full pb-10">
        <div className="flex flex-col gap-6 overflow-hidden overflow-y-auto h-[720px] pr-3">
          {/* Header */}
          {/* <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-4">
            <div className="text-2xl font-bold text-gray-800">
              Membership Application
            </div>
           
          </div> */}

          {/* Section: Membership Details */}
          <div className="bg-gray-50 rounded-lg p-6 mt-3 border border-gray-200">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Membership Details
              </h3>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 cursor-pointer hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-sm font-medium transition-colors"
                onClick={() => setShowNotebook(true)}
              >
                <Book size={16} className="text-blue-600" />
                View Services List Notebook
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Region
                </label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger
                    className={`w-full px-3 py-2 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      fieldErrors.regionId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.regionId && (
                  <p className="text-red-500 text-xs">{fieldErrors.regionId}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  District
                </label>
                <Select
                  value={districtId}
                  onValueChange={setDistrictId}
                  disabled={!regionId}
                >
                  <SelectTrigger
                    className={`w-full px-3 py-2 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      fieldErrors.districtId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.districtId && (
                  <p className="text-red-500 text-xs">
                    {fieldErrors.districtId}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Sector
                </label>
                <Select value={sectorId} onValueChange={setSectorId}>
                  <SelectTrigger
                    className={`w-full px-3 py-2 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      fieldErrors.sectorId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.sectorId && (
                  <p className="text-red-500 text-xs">{fieldErrors.sectorId}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 font-medium">
                  Category
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger
                    className={`w-full px-3 py-2 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      fieldErrors.categoryId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.categoryId && (
                  <p className="text-red-500 text-xs">
                    {fieldErrors.categoryId}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm text-gray-600 font-medium">
                  Subcategory
                </label>
                <Select
                  value={subcategoryId}
                  onValueChange={setSubcategoryId}
                  disabled={!categoryId}
                >
                  <SelectTrigger
                    className={`w-full px-3 py-2 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                      fieldErrors.subcategoryId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.subcategoryId && (
                  <p className="text-red-500 text-xs">
                    {fieldErrors.subcategoryId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Directors Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Directors
              </h3>
              <button
                type="button"
                onClick={addDirector}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded-sm transition-colors"
              >
                <Plus size={16} />
                Add another director
              </button>
            </div>

            {fieldErrors.directorsGeneral && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md font-medium text-sm mb-4">
                <AlertCircle size={16} className="text-red-400" />
                <span>{fieldErrors.directorsGeneral}</span>
              </div>
            )}

            <div className="space-y-4">
              {directors.map((d, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-gray-200 relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Name
                      </label>
                      <Input
                        placeholder="Enter full name"
                        value={d.name}
                        onChange={(e) =>
                          handleDirectorChange(i, "name", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedDirectors((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].name = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.directors &&
                          fieldErrors.directors[i]?.name &&
                          (touchedDirectors[i]?.name || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.directors &&
                        fieldErrors.directors[i]?.name &&
                        (touchedDirectors[i]?.name || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.directors[i].name}
                          </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Phone
                      </label>
                      <Input
                        placeholder="Enter phone number"
                        value={d.phone}
                        onChange={(e) =>
                          handleDirectorChange(i, "phone", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedDirectors((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].phone = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.directors &&
                          fieldErrors.directors[i]?.phone &&
                          (touchedDirectors[i]?.phone || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.directors &&
                        fieldErrors.directors[i]?.phone &&
                        (touchedDirectors[i]?.phone || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.directors[i].phone}
                          </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Email
                      </label>
                      <Input
                        placeholder="Enter email address"
                        value={d.email}
                        onChange={(e) =>
                          handleDirectorChange(i, "email", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedDirectors((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].email = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.directors &&
                          fieldErrors.directors[i]?.email &&
                          (touchedDirectors[i]?.email || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.directors &&
                        fieldErrors.directors[i]?.email &&
                        (touchedDirectors[i]?.email || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.directors[i].email}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Delete button */}
                  {directors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDirector(i)}
                      className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Remove director"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contacts Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Contacts
              </h3>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded-sm transition-colors"
              >
                <Plus size={16} />
                Add another contact
              </button>
            </div>

            {fieldErrors.contactsGeneral && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md font-medium text-sm mb-4">
                <AlertCircle size={16} className="text-red-400" />
                <span>{fieldErrors.contactsGeneral}</span>
              </div>
            )}

            <div className="space-y-4">
              {contacts.map((c, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-gray-200 relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Name
                      </label>
                      <Input
                        placeholder="Enter full name"
                        value={c.name}
                        onChange={(e) =>
                          handleContactChange(i, "name", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedContacts((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].name = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.contacts &&
                          fieldErrors.contacts[i]?.name &&
                          (touchedContacts[i]?.name || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.contacts &&
                        fieldErrors.contacts[i]?.name &&
                        (touchedContacts[i]?.name || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.contacts[i].name}
                          </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Phone
                      </label>
                      <Input
                        placeholder="Enter phone number"
                        value={c.phone}
                        onChange={(e) =>
                          handleContactChange(i, "phone", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedContacts((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].phone = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.contacts &&
                          fieldErrors.contacts[i]?.phone &&
                          (touchedContacts[i]?.phone || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.contacts &&
                        fieldErrors.contacts[i]?.phone &&
                        (touchedContacts[i]?.phone || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.contacts[i].phone}
                          </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-600 font-medium">
                        Email
                      </label>
                      <Input
                        placeholder="Enter email address"
                        value={c.email}
                        onChange={(e) =>
                          handleContactChange(i, "email", e.target.value)
                        }
                        onBlur={() =>
                          setTouchedContacts((prev) => {
                            const arr = [...prev];
                            if (!arr[i])
                              arr[i] = {
                                name: false,
                                phone: false,
                                email: false,
                              };
                            arr[i].email = true;
                            return arr;
                          })
                        }
                        className={`text-sm ${
                          fieldErrors.contacts &&
                          fieldErrors.contacts[i]?.email &&
                          (touchedContacts[i]?.email || forceShowErrors)
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                      />
                      {fieldErrors.contacts &&
                        fieldErrors.contacts[i]?.email &&
                        (touchedContacts[i]?.email || forceShowErrors) && (
                          <p className="text-red-500 text-xs">
                            {fieldErrors.contacts[i].email}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Delete button */}
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      className="absolute top-2 right-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Remove contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-medium text-[13px] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Preview Application
          </button>
        </div>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Preview Membership Application
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Review your details before submitting.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Membership Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Membership Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Region:</span>{" "}
                  <span className="font-medium">
                    {regions.find((r) => r.id === Number(regionId))?.name ||
                      "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">District:</span>{" "}
                  <span className="font-medium">
                    {districts.find((d) => d.id === Number(districtId))?.name ||
                      "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Sector:</span>{" "}
                  <span className="font-medium">
                    {sectors.find((s) => s.id === Number(sectorId))?.name ||
                      "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>{" "}
                  <span className="font-medium">
                    {categories.find((c) => c.id === Number(categoryId))
                      ?.name || "-"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Subcategory:</span>{" "}
                  <span className="font-medium">
                    {subcategories.find((s) => s.id === Number(subcategoryId))
                      ?.name || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Directors */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Directors
              </h3>
              <div className="space-y-2">
                {directors.map((d, i) => (
                  <div key={i} className="text-sm bg-white p-3 rounded border">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-gray-600">
                      {d.phone} • {d.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Contacts
              </h3>
              <div className="space-y-2">
                {contacts.map((c, i) => (
                  <div key={i} className="text-sm bg-white p-3 rounded border">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-600">
                      {c.phone} • {c.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={loading}
            >
              Edit Application
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Notebook Modal */}
      <CategoryNotebookModal
        open={showNotebook}
        onClose={() => setShowNotebook(false)}
      />

      {/* Success Dialog */}
      <Dialog
        open={!!successMsg}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessMsg(null);
            setSubmitted(false);
            if (onSuccess) onSuccess();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle size={64} className="text-green-600 mb-4" />
            <DialogTitle className="text-green-700 text-2xl font-bold mb-2 text-center">
              Application Submitted!
            </DialogTitle>
            <DialogDescription className="text-center text-base text-gray-700 mb-2">
              {successMsg}
            </DialogDescription>
            <Button
              className="mt-4 px-8 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
              onClick={() => {
                setSuccessMsg(null);
                setSubmitted(false);
                if (onSuccess) onSuccess();
              }}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-semibold text-base">
            <AlertCircle size={20} className="text-red-400" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
