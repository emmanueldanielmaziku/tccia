import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { TickCircle } from "iconsax-reactjs";
import CategoryNotebookModal from "./CategoryNotebookModal";
import { InfoCircle, Trash, Add } from "iconsax-reactjs";

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
    errors.directors = directors.map((d: any) => {
      const e: any = {};
      if (!d.name) e.name = "Name required";
      if (!d.phone) e.phone = "Phone required";
      if (!d.email) e.email = "Email required";
      return e;
    });
    errors.contacts = contacts.map((c: any) => {
      const e: any = {};
      if (!c.name) e.name = "Name required";
      if (!c.phone) e.phone = "Phone required";
      if (!c.email) e.email = "Email required";
      return e;
    });
    if (directors.length === 0)
      errors.directorsGeneral = "At least one director required.";
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
      <InfoCircle size={16} className="text-red-400" />
      <span>{children}</span>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-white p-8">
      <form onSubmit={handlePreview} className="space-y-10 flex-1">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <label className="block mb-1 font-medium">Region</label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger
                className={fieldErrors.regionId ? "border-red-500" : ""}
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
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.regionId}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">District</label>
            <Select
              value={districtId}
              onValueChange={setDistrictId}
              disabled={!regionId}
            >
              <SelectTrigger
                className={fieldErrors.districtId ? "border-red-500" : ""}
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
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.districtId}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Sector</label>
            <Select value={sectorId} onValueChange={setSectorId}>
              <SelectTrigger
                className={fieldErrors.sectorId ? "border-red-500" : ""}
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
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.sectorId}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-8 items-end">
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger
                className={fieldErrors.categoryId ? "border-red-500" : ""}
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
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.categoryId}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Subcategory</label>
            <Select
              value={subcategoryId}
              onValueChange={setSubcategoryId}
              disabled={!categoryId}
            >
              <SelectTrigger
                className={fieldErrors.subcategoryId ? "border-red-500" : ""}
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
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.subcategoryId}
              </div>
            )}
          </div>
          <div className="flex items-end h-full">
            <button
              type="button"
              className="w-full text-sm px-4 py-2 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowNotebook(true)}
            >
              View Services List Notebook
            </button>
          </div>
        </div>
        <div className="mt-8">
          <div className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Directors
          </div>
          {fieldErrors.directorsGeneral && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md font-medium text-sm mb-2">
              <InfoCircle size={16} className="text-red-400" />
              <span>{fieldErrors.directorsGeneral}</span>
            </div>
          )}
          {directors.map((d, i) => (
            <div key={i} className="grid grid-cols-4 gap-6 mb-4 items-center">
              {/* Name */}
              <div className="relative">
                <Input
                  placeholder="Name"
                  value={d.name}
                  onChange={(e) =>
                    handleDirectorChange(i, "name", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedDirectors((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].name = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.directors &&
                  fieldErrors.directors[i]?.name &&
                  (touchedDirectors[i]?.name || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.directors[i].name}
                    </div>
                  )}
              </div>
              {/* Phone */}
              <div className="relative">
                <Input
                  placeholder="Phone"
                  value={d.phone}
                  onChange={(e) =>
                    handleDirectorChange(i, "phone", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedDirectors((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].phone = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.directors &&
                  fieldErrors.directors[i]?.phone &&
                  (touchedDirectors[i]?.phone || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.directors[i].phone}
                    </div>
                  )}
              </div>
              {/* Email */}
              <div className="relative">
                <Input
                  placeholder="Email"
                  value={d.email}
                  onChange={(e) =>
                    handleDirectorChange(i, "email", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedDirectors((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].email = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.directors &&
                  fieldErrors.directors[i]?.email &&
                  (touchedDirectors[i]?.email || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.directors[i].email}
                    </div>
                  )}
              </div>
              {/* Delete button */}
              <div className="flex items-center justify-center h-full">
                {directors.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDirector(i)}
                  >
                    <Trash size={18} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={addDirector}
          >
            <Add size={16} className="mr-1" /> Add Director
          </Button>
        </div>
        <div className="mt-8">
          <div className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
            Contacts
          </div>
          {fieldErrors.contactsGeneral && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-md font-medium text-sm mb-2">
              <InfoCircle size={16} className="text-red-400" />
              <span>{fieldErrors.contactsGeneral}</span>
            </div>
          )}
          {contacts.map((c, i) => (
            <div key={i} className="grid grid-cols-4 gap-6 mb-4 items-center">
              {/* Name */}
              <div className="relative">
                <Input
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) =>
                    handleContactChange(i, "name", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedContacts((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].name = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.contacts &&
                  fieldErrors.contacts[i]?.name &&
                  (touchedContacts[i]?.name || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.contacts[i].name}
                    </div>
                  )}
              </div>
              {/* Phone */}
              <div className="relative">
                <Input
                  placeholder="Phone"
                  value={c.phone}
                  onChange={(e) =>
                    handleContactChange(i, "phone", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedContacts((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].phone = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.contacts &&
                  fieldErrors.contacts[i]?.phone &&
                  (touchedContacts[i]?.phone || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.contacts[i].phone}
                    </div>
                  )}
              </div>
              {/* Email */}
              <div className="relative">
                <Input
                  placeholder="Email"
                  value={c.email}
                  onChange={(e) =>
                    handleContactChange(i, "email", e.target.value)
                  }
                  onBlur={() =>
                    setTouchedContacts((prev) => {
                      const arr = [...prev];
                      if (!arr[i])
                        arr[i] = { name: false, phone: false, email: false };
                      arr[i].email = true;
                      return arr;
                    })
                  }
                  className={`w-full px-6 py-4 pr-10 ${
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                      <InfoCircle size={16} />
                    </span>
                  )}
                {fieldErrors.contacts &&
                  fieldErrors.contacts[i]?.email &&
                  (touchedContacts[i]?.email || forceShowErrors) && (
                    <div className="absolute left-0 -bottom-5 text-xs text-red-500">
                      {fieldErrors.contacts[i].email}
                    </div>
                  )}
              </div>
              {/* Delete button */}
              <div className="flex items-center justify-center h-full">
                {contacts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContact(i)}
                  >
                    <Trash size={18} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={addContact}
          >
            <Add size={16} className="mr-1" /> Add Contact
          </Button>
        </div>
        <div className="flex justify-end gap-4 mt-10">
          <Button
            type="submit"
            variant="default"
            className="px-8 py-3 rounded-lg font-semibold text-base"
            disabled={loading}
          >
            Preview
          </Button>
        </div>
      </form>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Membership Application</DialogTitle>
            <DialogDescription>
              Review your details before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>
              <b>Region:</b>{" "}
              {regions.find((r) => r.id === Number(regionId))?.name || "-"}
            </div>
            <div>
              <b>District:</b>{" "}
              {districts.find((d) => d.id === Number(districtId))?.name || "-"}
            </div>
            <div>
              <b>Sector:</b>{" "}
              {sectors.find((s) => s.id === Number(sectorId))?.name || "-"}
            </div>
            <div>
              <b>Category:</b>{" "}
              {categories.find((c) => c.id === Number(categoryId))?.name || "-"}
            </div>
            <div>
              <b>Subcategory:</b>{" "}
              {subcategories.find((s) => s.id === Number(subcategoryId))
                ?.name || "-"}
            </div>
            <div>
              <b>Directors:</b>{" "}
              <ul className="list-disc ml-6">
                {directors.map((d, i) => (
                  <li key={i}>
                    {d.name} - {d.phone} - {d.email}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <b>Contacts:</b>{" "}
              <ul className="list-disc ml-6">
                {contacts.map((c, i) => (
                  <li key={i}>
                    {c.name} - {c.phone} - {c.email}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowPreview(false)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button variant="default" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <TickCircle
              size={64}
              color="#22c55e"
              variant="Bulk"
              className="mb-4"
            />
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
      {errorMsg && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-semibold text-base">
            <InfoCircle size={20} className="text-red-400" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
