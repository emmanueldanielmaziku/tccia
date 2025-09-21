import { useEffect, useState } from "react";
import {
  InfoCircle,
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
  Copy,
  TickCircle,
} from "iconsax-reactjs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  subsector_id: number;
  subsector_name: string;
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
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  
  function fetchApplicationData() {
    if (!tin) return;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/membership/application/${tin}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          onHasApplication?.(true);
        } else {
          setError(res.message || "No membership application found.");
          onHasApplication?.(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch application.");
        onHasApplication?.(false);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchApplicationData();
  }, [tin]);

  function formatNumber(num?: number) {
    return num?.toLocaleString() ?? "-";
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const statusColorMap: Record<string, string> = {
    draft: "bg-gray-200 text-gray-700",
    submitted: "bg-blue-200 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    sent_to_approver: "bg-purple-200 text-purple-800",
    approved: "bg-green-100 text-green-700",
    waiting_payment: "bg-orange-100 text-orange-700",
    paid: "bg-green-200 text-green-800",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-red-100 text-red-700",
  };

  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <div className="flex items-center gap-2 text-blue-800 font-semibold text-base mb-3 border-l-4 border-blue-400 pl-3 bg-blue-50 py-1 rounded">
      {icon} {title}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-50 px-6 py-5 border-b border-blue-100">
          <div className="flex items-start md:items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full bg-blue-100" />
            <div>
              <Skeleton className="h-6 w-48 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-32 bg-blue-100" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-40 bg-blue-100 rounded-lg" />
            <Skeleton className="h-8 w-40 bg-blue-100 rounded-lg" />
          </div>
        </div>
        {/* Main Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-8 px-6 py-8">
          {/* Company Info */}
          <div>
            <Skeleton className="h-6 w-32 mb-4 bg-blue-100 rounded" />
            <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-48 bg-blue-100" />
          </div>
          {/* Membership Details */}
          <div>
            <Skeleton className="h-6 w-40 mb-4 bg-blue-100 rounded" />
            <Skeleton className="h-4 w-36 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-36 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-36 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-36 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-36 bg-blue-100" />
          </div>
          {/* Invoice & Payment */}
          <div>
            <Skeleton className="h-6 w-44 mb-4 bg-blue-100 rounded" />
            <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-48 bg-blue-100" />
          </div>
          {/* Dates & TIN */}
          <div>
            <Skeleton className="h-6 w-32 mb-4 bg-blue-100 rounded" />
            <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
            <Skeleton className="h-4 w-32 bg-blue-100" />
          </div>
        </div>
        {/* Directors & Contacts Skeleton */}
        <div className="px-6 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-6 w-32 mb-4 bg-blue-100 rounded" />
              <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-36 bg-blue-100" />
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-4 bg-blue-100 rounded" />
              <Skeleton className="h-4 w-40 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-32 mb-2 bg-blue-100" />
              <Skeleton className="h-4 w-36 bg-blue-100" />
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
        <Alert className="w-full max-w-md mx-auto border-0 bg-white text-center flex flex-col items-center">
          <AlertTitle className="text-lg font-semibold text-blue-800 w-full text-center">
            No Membership Application Found
          </AlertTitle>
          <AlertDescription className="mt-2 text-gray-600 w-full text-center flex flex-col items-center">
            There is no membership application for this TIN.
            <br />
            <span className="block mt-2 text-xs text-blue-500">
              Start a new application to become a member.
            </span>
            {/* <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-semibold"
              onClick={() => window.location.reload()}
            >
              Retry
            </button> */}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-50 px-6 py-5 border-b border-blue-100">
        <div className="flex items-start md:items-center gap-4">
          <Profile2User size={38} color="#2563eb" variant="Bulk" />
          <div>
            <div className="text-xl font-bold text-blue-900 flex items-center gap-2 flex-wrap">
              {data.company_name}
              <span
                className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1 ${
                  statusColorMap[data.state] ?? "bg-gray-100 text-gray-700"
                }`}
                title={data.state}
              >
                {data.state.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                <InfoCircle size={16} />
              </span>
            </div>
            <div className="text-sm text-blue-700 font-medium">
              Application #{data.application_number}
            </div>
          </div>
        </div>

        <div className={`flex flex-wrap justify-start md:justify-end gap-2 cursor-pointer`}>
          {data.state !== "expired" && (
            <button
              onClick={async () => {
                if (data.state !== "paid") return;
                setDownloading(true);
                try {
                  console.log("Attempting to download certificate for ID:", data.id);
                  const res = await fetch(`/api/proxy/certificate/${data.id}`);
                  console.log("Response status:", res.status);
                  console.log("Response headers:", res.headers);
                  
                  if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Download failed:", errorText);
                    throw new Error(`Download failed: ${res.status} - ${errorText}`);
                  }

                  const contentType = res.headers.get('content-type');
                  console.log("Content type:", contentType);
                  
                  const blob = await res.blob();
                  console.log("Blob size:", blob.size);
                  
                  if (blob.size === 0) {
                    throw new Error("Downloaded file is empty");
                  }
                  
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `membership_certificate_${data.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  console.log("Download completed successfully");
                } catch (error) {
                  console.error("Certificate download error:", error);
                  alert(`Failed to download certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                setDownloading(false);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-semibold cursor-pointer  ${
                data.state === "paid"
                  ? downloading
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={downloading || data.state !== "paid"}
              title={data.state !== "paid" ? "Certificate is only available after payment." : downloading ? "Downloading..." : "Download Certificate"}
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <DocumentText size={20} />
                  Download Certificate
                </>
              )}
            </button>
          )}
          {/* {data.state === "expired" && (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-[10px] hover:bg-orange-700 transition text-sm font-semibold cursor-pointer"
              onClick={() => setShowRenewForm(true)}
            >
              <Refresh size={20} />
              Change Membership
            </button>
          )} */}
        </div>
      </div>

      {showRenewForm && data && (
        <>
          {/* Blurred overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowRenewForm(false)}
            aria-label="Close renewal form"
          />
          {/* Renewal form container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
                onClick={() => setShowRenewForm(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <MembershipApplicationForm
                onSuccess={() => {
                  setShowRenewForm(false);
                  fetchApplicationData();
                }}
                submitLabel="Change Membership"
                action="renew"
                membershipId={data.id}
                existingData={data}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-8 px-6 py-8">
        {/* Company Info */}
        <div>
          <SectionHeader icon={<Home size={18} />} title="Company Info" />
          <div className="text-sm text-gray-700 mb-1">
            <ProfileCircle size={16} className="inline mr-1" /> {data.company_name}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <Sms size={16} className="inline mr-1" /> {data.company_email}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <Call size={16} className="inline mr-1" /> {data.company_telephone_number}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <Location size={16} className="inline mr-1" /> {data.company_physical_address}
          </div>
          <div className="text-sm text-gray-700">
            <Note size={16} className="inline mr-1" /> {data.company_description}
          </div>
        </div>

        {/* Membership */}
        <div>
          <SectionHeader icon={<Category size={18} />} title="Membership Details" />
          <div className="text-sm text-gray-700">Category: <strong>{data.category_name}</strong></div>
          <div className="text-sm text-gray-700">Subcategory: <strong>{data.subcategory_name}</strong></div>
          <div className="text-sm text-gray-700">Region: <strong>{data.region_name}</strong></div>
          <div className="text-sm text-gray-700">District: <strong>{data.district_name}</strong></div>
          <div className="text-sm text-gray-700">Sector: <strong>{data.sector_name}</strong></div>
          <div className="text-sm text-gray-700">Subsector: <strong>{data.subsector_name}</strong></div>
        </div>

        {/* Invoice + TIN */}
        <div>
          <SectionHeader icon={<Receipt size={18} />} title="Invoice & Payment" />
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <div> 
              <span>
                Services: 
              </span>
            </div>
            <span>Invoice Number:</span>
            {data.invoice_number ? (
              <>
                <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded select-all text-base tracking-wide">
                  {data.invoice_number}
                </span>
                <button
                  className={`ml-1 p-1 rounded hover:bg-blue-100 transition border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300`}
                  title={copied ? "Copied!" : "Copy Invoice Number"}
                  aria-label="Copy Invoice Number"
                  onClick={() => {
                    if (data.invoice_number) {
                      navigator.clipboard.writeText(data.invoice_number.toString());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }
                  }}
                  disabled={copied}
                >
                  {copied ? <TickCircle size={18} color="#22c55e" /> : <Copy size={18} color="#2563eb" />}
                </button>
              </>
            ) : (
              <span className="text-red-600">Not generated yet</span>
            )}
          </div>
          {data.invoice_number && (
            <div className="text-sm text-blue-700 font-semibold mb-2">
              Membership Fee: {formatNumber(data.total_fee)} TZS
            </div>
          )}
          <div className="text-sm text-gray-600">
            Use the invoice number to make payment via bank or mobile money.
          </div>
        </div>

        {/* Dates */}
        <div>
          <SectionHeader icon={<Calendar size={18} />} title="Dates & TIN" />
          <div className="text-sm text-gray-700 mb-1">
            Applied: {formatDate(data.application_date)}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            Submission: {formatDate(data.submission_date)}
          </div>
          <div className="text-sm text-gray-700">
            TIN Verification:{" "}
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                data.tin_verification_status.toLowerCase() === "verified"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {data.tin_verification_status}
            </span>
          </div>
        </div>
      </div>

      {/* Directors & Contacts */}
      <div className="px-6 pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <SectionHeader icon={<Profile2User size={18} />} title="Directors" />
            {data.directors.length > 0 ? (
              <ul className="bg-blue-50 rounded-lg divide-y divide-blue-100">
                {data.directors.map((d) => (
                  <li key={d.id} className="py-2 px-3 space-y-1">
                    <div className="text-blue-900 font-semibold">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.phone}</div>
                    <div className="text-xs text-gray-500">{d.email}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No directors listed.</p>
            )}
          </div>
          <div>
            <SectionHeader icon={<Message size={18} />} title="Contacts" />
            {data.contacts.length > 0 ? (
              <ul className="bg-blue-50 rounded-lg divide-y divide-blue-100">
                {data.contacts.map((c) => (
                  <li key={c.id} className="py-2 px-3 space-y-1">
                    <div className="text-blue-900 font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No contacts listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
