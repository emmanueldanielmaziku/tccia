import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DocumentText,
  Profile2User,
  Sms,
  Home,
  Category,
  Receipt,
  Calendar,
  Verify,
  Money,
  Note,
  Location,
  Call,
  Message,
  ProfileCircle,
  Refresh,
} from "iconsax-reactjs";
import MembershipApplicationForm from "./MembershipApplicationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Director {
  id: number;
  name: string;
  phone: string;
  email: string;
}
interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
}
interface ApplicationData {
  id: number;
  application_number: string;
  state: string;
  company_tin: string;
  company_name: string;
  company_email: string;
  company_telephone_number: string;
  company_physical_address: string;
  company_description: string;
  category_id: number;
  category_name: string;
  subcategory_id: number;
  subcategory_name: string;
  region_id: number;
  region_name: string;
  district_id: number;
  district_name: string;
  sector_id: number;
  sector_name: string;
  entry_fee: number;
  annual_fee: number;
  certificate_fee: number;
  total_fee: number;
  directors: Director[];
  contacts: Contact[];
  application_date: string;
  submission_date: string;
  invoice_number: string | false;
  tin_verification_status: string;
}

export default function MembershipApplication({
  tin,
  onHasApplication,
}: {
  tin: string;
  onHasApplication?: (has: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRenewForm, setShowRenewForm] = useState(false);

  useEffect(() => {
    if (!tin) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/membership/application/${tin}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          if (onHasApplication) onHasApplication(true);
        } else {
          setError(res.message || "No membership application found.");
          if (onHasApplication) onHasApplication(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch application.");
        if (onHasApplication) onHasApplication(false);
        setLoading(false);
      });
  }, [tin]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg bg-white mt-8 overflow-hidden border border-blue-100 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-50 px-6 py-5 border-b border-blue-100">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-blue-100" />
            <div>
              <Skeleton className="h-6 w-48 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-32 bg-blue-100" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-32 bg-blue-100" />
            <Skeleton className="h-3 w-24 bg-blue-100" />
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-40 bg-blue-100" />
            <Skeleton className="h-4 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-28 bg-blue-100" />
            <Skeleton className="h-4 w-36 bg-blue-100" />
            <Skeleton className="h-4 w-44 bg-blue-100" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-40 bg-blue-100" />
            <Skeleton className="h-4 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-28 bg-blue-100" />
            <Skeleton className="h-4 w-36 bg-blue-100" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-blue-100" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-6 w-20 rounded-full bg-blue-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-blue-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-blue-100" />
              <Skeleton className="h-6 w-24 rounded-full bg-blue-200" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-40 bg-blue-100" />
            <Skeleton className="h-4 w-32 bg-blue-100" />
            <Skeleton className="h-4 w-28 bg-blue-100" />
            <Skeleton className="h-4 w-36 bg-blue-100" />
          </div>
        </div>
        {/* Directors & Contacts Skeleton */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-5 w-32 mb-2 bg-blue-100" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-blue-100" />
                <Skeleton className="h-4 w-32 bg-blue-100" />
                <Skeleton className="h-4 w-36 bg-blue-100" />
              </div>
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2 bg-blue-100" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-blue-100" />
                <Skeleton className="h-4 w-32 bg-blue-100" />
                <Skeleton className="h-4 w-36 bg-blue-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <div
          className="mb-6 flex items-center justify-center rounded-full bg-blue-50"
          style={{ width: 80, height: 80 }}
        >
          <DocumentText size={48} color="#3b82f6" variant="Bulk" />
        </div>
        <Alert className="max-w-md mx-auto border-0 bg-white flex flex-col items-center text-center">
          <AlertTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2 justify-center text-center w-full">
            No Membership Application Found
          </AlertTitle>
          <AlertDescription className="mt-2 text-gray-600 text-center w-full flex flex-col items-center">
            There is no membership application for this TIN yet.
            <br />
            <span className="block mt-2 text-xs text-blue-500">
              Start a new application to become a member.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Helper for thousands separator
  function formatNumber(num: number | undefined) {
    return num?.toLocaleString() ?? "-";
  }

  // Status color mapping
  const statusColorMap = {
    draft: "bg-gray-200 text-gray-700",
    submitted: "bg-blue-200 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    sent_to_approver: "bg-purple-200 text-purple-800",
    approved: "bg-green-100 text-green-700",
    waiting_payment: "bg-orange-100 text-orange-700",
    paid: "bg-green-200 text-green-800",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-gray-300 text-gray-600",
  };

  // Modern, sectioned card layout
  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg bg-white mt-8 overflow-hidden border border-blue-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-50 px-6 py-5 border-b border-blue-100">
        <div className="flex items-center gap-4">
          <Profile2User size={38} color="#2563eb" variant="Bulk" />
          <div>
            <div className="text-xl font-bold text-blue-900 flex items-center gap-2">
              {data.company_name}
              <span
                className={`ml-2 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide ${
                  statusColorMap[data.state as keyof typeof statusColorMap] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {data.state
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Application #{data.application_number}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <a
            href={`/api/proxy/certificate/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-sm shadow hover:bg-blue-600 transition-colors font-semibold text-sm"
            download
          >
            <DocumentText size={20} className="mr-1" />
            Download Certificate
          </a>
          {data.state === "expired" && (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors font-semibold text-sm"
              onClick={() => setShowRenewForm(true)}
            >
              <Refresh size={20} className="mr-1" />
              Renew Membership
            </button>
          )}
        </div>
      </div>
      {/* Renew Membership Dialog */}
      <Dialog open={showRenewForm} onOpenChange={setShowRenewForm}>
        <DialogContent className="max-w-2xl">
          <MembershipApplicationForm
            onSuccess={() => setShowRenewForm(false)}
            submitLabel="Renew Membership"
            action="renew"
          />
        </DialogContent>
      </Dialog>
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-1">
            <Home size={18} /> Company Info
          </div>
          <div className="text-sm text-gray-700">
            <ProfileCircle size={16} className="inline mr-1" />{" "}
            {data.company_name}
          </div>
          <div className="text-sm text-gray-700">
            <Sms size={16} className="inline mr-1" /> {data.company_email}
          </div>
          <div className="text-sm text-gray-700">
            <Call size={16} className="inline mr-1" />{" "}
            {data.company_telephone_number}
          </div>
          <div className="text-sm text-gray-700">
            <Location size={16} className="inline mr-1" />{" "}
            {data.company_physical_address}
          </div>
          <div className="text-sm text-gray-700">
            <Note size={16} className="inline mr-1" />{" "}
            {data.company_description}
          </div>
        </div>
        {/* Membership Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-1">
            <Category size={18} /> Membership Details
          </div>
          <div className="text-sm text-gray-700">
            Category:{" "}
            <span className="font-semibold">{data.category_name}</span>
          </div>
          <div className="text-sm text-gray-700">
            Subcategory:{" "}
            <span className="font-semibold">{data.subcategory_name}</span>
          </div>
          <div className="text-sm text-gray-700">
            Region: <span className="font-semibold">{data.region_name}</span>
          </div>
          <div className="text-sm text-gray-700">
            District:{" "}
            <span className="font-semibold">{data.district_name}</span>
          </div>
          <div className="text-sm text-gray-700">
            Sector: <span className="font-semibold">{data.sector_name}</span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Verify size={18} className="mr-1" /> TIN:{" "}
            <span className="font-semibold">{data.company_tin}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={16} /> Applied:{" "}
            {new Date(data.application_date).toLocaleDateString()}
          </div>
        </div>
        {/* Fees */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-1">
            <Money size={18} /> Fees
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Receipt size={14} /> Entry: {data.entry_fee}
            </span> */}
            {/* <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Receipt size={14} /> Annual: {formatNumber(data.annual_fee)}
            </span> */}
            {/* <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Receipt size={14} /> Certificate: {data.certificate_fee}
            </span> */}
            {/* <br /> */}
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Receipt size={14} /> Total: {formatNumber(data.total_fee)}
            </div>
          </div>
        </div>
        {/* Dates & Invoice */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-1">
            <Calendar size={18} /> Dates & Invoice
          </div>
          <div className="text-sm text-gray-700">
            Application:{" "}
            <span className="font-semibold">
              {new Date(data.application_date).toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-700">
            Submission:{" "}
            <span className="font-semibold">
              {new Date(data.submission_date).toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-700">
            Invoice:{" "}
            <span className="font-semibold">
              {data.invoice_number ? data.invoice_number : "-"}
            </span>
          </div>
          <div className="text-sm text-gray-700">
            TIN Verification:{" "}
            {(() => {
              const status = data.tin_verification_status || "";
              const capitalized =
                status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
              const isVerified = status.trim().toLowerCase() === "verified";
              return (
                <span
                  className={`font-semibold px-2 py-1 rounded-full text-xs ml-1 ${
                    isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {capitalized}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Directors & Contacts */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-2">
              <Profile2User size={18} /> Directors
            </div>
            <ul className="divide-y divide-blue-50 bg-blue-50 rounded-lg">
              {data.directors.map((d) => (
                <li
                  key={d.id}
                  className="py-2 px-3 flex flex-col md:flex-row md:items-center gap-1 md:gap-3"
                >
                  <span className="font-semibold text-blue-900">{d.name}</span>
                  <span className="text-xs text-gray-500">{d.phone}</span>
                  <span className="text-xs text-gray-500">{d.email}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-2">
              <Profile2User size={18} /> Contacts
            </div>
            <ul className="divide-y divide-blue-50 bg-blue-50 rounded-lg">
              {data.contacts.map((c) => (
                <li
                  key={c.id}
                  className="py-2 px-3 flex flex-col md:flex-row md:items-center gap-1 md:gap-3"
                >
                  <span className="font-semibold text-blue-900">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.phone}</span>
                  <span className="text-xs text-gray-500">{c.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
