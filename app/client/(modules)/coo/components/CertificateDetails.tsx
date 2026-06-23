"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

function safeValue(val: any) {
  return val === false || val === undefined || val === null ? "-" : val;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-gray-100 last:border-b-0">
      <span className="text-xs font-medium text-gray-500 min-w-[180px] sm:min-w-[220px] shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900 break-all">
        {safeValue(value)}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-blue-700 mb-2 pb-1 border-b-2 border-blue-200 uppercase tracking-wide">
        {title}
      </h3>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {children}
      </div>
    </div>
  );
}

interface CertificateDetailsProps {
  certificateData: any;
}

export default function CertificateDetails({ certificateData }: CertificateDetailsProps) {
  if (!certificateData) return null;

  const { message_info, transport = [], invoice = [], item = [], attachment = [] } = certificateData;

  return (
    <div className="space-y-4">
      {/* Application Information */}
      <Section title="Application Information">
        <Field label="Application UUID" value={message_info.application_uuid} />
        <Field label="Organization Code" value={message_info.organization_code} />
        <Field label="Certificate Type ID" value={message_info.certificate_type_id} />
        <Field label="Application Code Number" value={message_info.application_code_number} />
        <Field label="Application Degree" value={message_info.application_degree} />
        <Field label="Application Type Code" value={message_info.application_type_code} />
        <Field label="Classification Code" value={message_info.application_classification_code} />
        <Field label="State Code" value={message_info.application_state_code} />
        <Field label="Control Number" value={message_info.control_number} />
        <Field label="Certificate Cost" value={message_info.certificate_cost} />
        <Field label="Submitted Date" value={formatDate(message_info.submitted_date)} />
        <Field label="Status" value={message_info.status} />
      </Section>

      {/* Header Information */}
      <Section title="Header Information">
        <Field label="Interface ID" value={message_info.interface_id} />
        <Field label="Send Date & Time" value={message_info.send_date_and_time} />
        <Field label="Sender ID" value={message_info.sender_id} />
        <Field label="Receiver ID" value={message_info.receiver_id} />
        <Field label="Reference Number" value={message_info.reference_number} />
        <Field label="UCR Number" value={message_info.ucr_number} />
        <Field label="Approval Date & Time" value={message_info.approval_date_and_time} />
      </Section>

      {/* Party Information */}
      <Section title="Party Information">
        <Field label="Party UUID" value={message_info.party_uuid} />
        <Field label="Party Name" value={message_info.party_name} />
        <Field label="Party Type Code" value={message_info.party_type_code} />
        <Field label="Party TIN" value={message_info.party_tin} />
        <Field label="Country Code" value={message_info.party_country_code} />
        <Field label="Physical Address" value={message_info.party_physical_address} />
        <Field label="Contact Officer Name" value={message_info.party_contact_officer_name} />
        <Field label="Contact Officer Phone" value={message_info.party_contact_officer_telephone_number} />
        <Field label="Contact Officer Email" value={message_info.party_contact_officer_email} />
      </Section>

      {/* Transport Details */}
      {transport.length > 0 && (
        <Section title="Transport Details">
          {transport.map((t: any, i: number) => (
            <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
              {transport.length > 1 && (
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Entry #{i + 1}</h4>
              )}
              <Field label="Transport Mode Code" value={t.transport_mode_code} />
              <Field label="Means Name" value={t.transport_means_name} />
              <Field label="Means Number" value={t.transport_means_number} />
              <Field label="Company Name" value={t.transport_company_name} />
              <Field label="Departure Expected Date" value={t.departure_expected_date} />
              <Field label="Arrival Expected Date" value={t.arrival_expected_date} />
              <Field label="Departure Port Code" value={t.departure_port_code} />
              <Field label="Arrival Port Code" value={t.arrival_port_code} />
              <Field label="Container Number" value={t.container_number} />
              <Field label="Container Size Code" value={t.container_size_code} />
              <Field label="Container Count" value={t.container_count} />
            </div>
          ))}
        </Section>
      )}

      {/* Invoice Details */}
      {invoice.length > 0 && (
        <Section title="Invoice Details">
          {invoice.map((inv: any, i: number) => (
            <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
              {invoice.length > 1 && (
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Entry #{i + 1}</h4>
              )}
              <Field label="Invoice UUID" value={inv.invoice_uuid} />
              <Field label="Invoice Number" value={inv.invoice_number} />
              <Field label="Delivery Terms Code" value={inv.delivery_terms_code} />
              <Field label="Currency Code" value={inv.invoice_currency_code} />
              <Field label="Exchange Rate" value={inv.invoice_exchange_rate} />
              <Field label="Customs Value" value={inv.customs_value} />
              <Field label="Customs USD Value" value={inv.customs_usd_value} />
            </div>
          ))}
        </Section>
      )}

      {/* Item Details */}
      {item.length > 0 && (
        <Section title="Item Details">
          {item.map((it: any, i: number) => (
            <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
              {item.length > 1 && (
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Entry #{i + 1}</h4>
              )}
              <Field label="Item UUID" value={it.item_uuid} />
              <Field label="Item Number" value={it.item_number} />
              <Field label="HS Code" value={it.hs_code} />
              <Field label="Description" value={it.item_description} />
              <Field label="Quantity" value={it.item_quantity} />
              <Field label="Quantity Unit Code" value={it.item_quantity_unit_code} />
              <Field label="Origin Country Code" value={it.origin_country_code} />
              <Field label="Item Value" value={it.item_value} />
              <Field label="Currency Code" value={it.currency_code} />
            </div>
          ))}
        </Section>
      )}

      {/* Attachments */}
      {attachment.length > 0 && (
        <Section title="Attachments">
          {attachment.map((att: any, i: number) => (
            <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
              {attachment.length > 1 && (
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Entry #{i + 1}</h4>
              )}
              <Field label="Serial Number" value={att.attachment_serial_number} />
              <Field label="Type Code" value={att.attachment_type_code} />
              {att.attachment_link && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-gray-100 last:border-b-0">
                  <span className="text-xs font-medium text-gray-500 min-w-[180px] sm:min-w-[220px] shrink-0">
                    Action
                  </span>
                  <button
                    onClick={() => {
                      const url = att.attachment_link as string;
                      const toastId = toast.loading("Downloading...");
                      fetch(url)
                        .then((res) => {
                          if (!res.ok) throw new Error();
                          const contentType = res.headers.get("Content-Type") || "";
                          const ext = contentType.includes("pdf")
                            ? "pdf"
                            : contentType.includes("image/")
                            ? contentType.split("/")[1] || "png"
                            : "";
                          return res.blob().then((blob) => ({ blob, ext }));
                        })
                        .then(({ blob, ext }) => {
                          let filename = new URL(url).pathname.split("/").pop() || "attachment";
                          if (!/\.[a-z0-9]+$/i.test(filename)) {
                            filename += ext ? `.${ext}` : ".pdf";
                          }
                          const objUrl = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = objUrl;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(objUrl);
                          toast.dismiss(toastId);
                          toast.success("Download complete");
                        })
                        .catch(() => {
                          toast.dismiss(toastId);
                          window.open(url, "_blank");
                          toast.success("Opening attachment...");
                        });
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    Download Attachment
                  </button>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
