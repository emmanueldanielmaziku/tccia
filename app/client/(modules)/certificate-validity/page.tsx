"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Copy, Info, XCircle } from "lucide-react";

type UpstreamJsonRpc = {
  jsonrpc?: string;
  id?: null | string;
  result?: {
    message_info?: {
      remark?: string;
      exporter_name?: string;
      exporter_address?: string;
      exporter_telephone_number?: string;
      exporter_email_address?: string;
      exporter_tin?: string;
      consignee_name?: string;
      consignee_address?: string;
      consignee_tin?: string | boolean;
      reference_number?: string;
      application_uuid?: string;
      approval_date_and_time?: string;
      certificate_type_id?: string;
      approver_name?: string;
      issue_country_code?: string;
      destination_country_code?: string;
      applicant_name?: string;
      applicant_address?: string;
      application_place_name?: string;
      item_info?: Array<{
        item_number?: string;
        hs8_code?: string;
        product_description?: string;
        package_number?: string;
        package_unit_code?: string;
        gross_weight?: string;
        gross_weight_unit_code?: string;
      }>;
    };
    error?: string;
  };
};

export default function CertificateValidityPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpstreamJsonRpc["result"] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCheck = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/certificate/by_reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_number: referenceNumber.trim() }),
      });

      const data: UpstreamJsonRpc = await response.json().catch(() => ({}));

      const upstreamResult = data?.result || null;
      setResult(upstreamResult);

      if (upstreamResult?.error) {
        setError(upstreamResult.error);
      } else if (!response.ok) {
        setError("Failed to check certificate validity");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Certificate validity check failed:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const messageInfo = result?.message_info;
  const isValid = !!messageInfo && !error;

  const items = messageInfo?.item_info || [];
  const firstItem = items[0];

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber.trim());
    } catch (err) {
      console.error("Copy reference failed:", err);
    }
  };

  return (
    <main className="w-full h-[97vh] rounded-[12px] sm:rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      {/* Simple header to keep this page usable without authentication */}
      <div className="absolute inset-x-0 top-0 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-10">
        <div className="px-4 py-3">
          <div className="text-gray-700 text-sm sm:text-base font-semibold">
            Certificate Validity Check
          </div>
          <div className="text-gray-500 text-xs sm:text-sm">
            Enter a certificate reference number to verify its availability.
          </div>
        </div>
      </div>

      {/* Keep spacing for the header */}
      <section className="pt-16 px-4 sm:px-8 pb-8 h-full overflow-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Check Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">
                  Certificate Reference Number
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. OGAM0003CA26C0000000022"
                    className="font-mono tracking-wide"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !referenceNumber.trim()}
                    className="sm:w-[220px]"
                  >
                    {loading ? "Checking..." : "Check Validity"}
                  </Button>
                </div>
              </div>

              {loading && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              )}

              {hasSearched && !loading && error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="text-red-600 mt-0.5" size={18} />
                    <div>
                      <div className="font-semibold text-red-700">
                        Certificate not found
                      </div>
                      <div className="text-sm text-red-700 mt-1">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {hasSearched && !loading && isValid && messageInfo && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-700" size={18} />
                      <div className="font-semibold text-green-800">
                        Certificate available
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white text-green-800 border-green-200"
                    >
                      {messageInfo.remark || "available"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="text-gray-500">Reference</div>
                      <div className="font-medium font-mono">
                        {messageInfo.reference_number || referenceNumber}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">Certificate Type</div>
                      <div className="font-medium">
                        {messageInfo.certificate_type_id || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">Exporter</div>
                      <div className="font-medium">
                        {messageInfo.exporter_name || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">Consignee</div>
                      <div className="font-medium">
                        {messageInfo.consignee_name || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">Approval date</div>
                      <div className="font-medium">
                        {messageInfo.approval_date_and_time || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">Approver</div>
                      <div className="font-medium">
                        {messageInfo.approver_name || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        {items.length}
                      </span>{" "}
                      item(s) found
                    </div>
                    <div className="sm:ml-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        onClick={handleCopyReference}
                      >
                        <Copy size={16} className="mr-2" />
                        Copy ref
                      </Button>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <div className="rounded-md border border-gray-200 bg-white p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Info size={16} className="text-gray-500" />
                        Items (preview)
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        {firstItem && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div className="text-gray-500">HS8 Code</div>
                              <div className="font-mono font-medium">
                                {firstItem.hs8_code || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Description</div>
                              <div className="font-medium">
                                {firstItem.product_description || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Package</div>
                              <div className="font-medium">
                                {firstItem.package_number || "-"}{" "}
                                {firstItem.package_unit_code || ""}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value="details">
                      <AccordionTrigger>
                        Full certificate details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-gray-700 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="text-gray-500">Exporter address</div>
                              <div className="font-medium">
                                {messageInfo.exporter_address || "-"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-500">
                                Exporter email/phone
                              </div>
                              <div className="font-medium">
                                {messageInfo.exporter_email_address || "-"}
                                {messageInfo.exporter_telephone_number
                                  ? ` (${messageInfo.exporter_telephone_number})`
                                  : ""}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-500">Applicant</div>
                              <div className="font-medium">
                                {messageInfo.applicant_name || "-"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-500">Applicant address</div>
                              <div className="font-medium">
                                {messageInfo.applicant_address || "-"}
                              </div>
                            </div>
                          </div>

                          {items.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-medium text-gray-800">
                                Items
                              </div>
                              <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs text-gray-600 font-medium">
                                  <div className="col-span-2">#</div>
                                  <div className="col-span-4">HS8</div>
                                  <div className="col-span-6">Description</div>
                                </div>
                                <div className="divide-y">
                                  {items.map((it, idx) => (
                                    <div
                                      key={`${it.item_number || idx}-${idx}`}
                                      className="grid grid-cols-12 px-3 py-2 text-sm text-gray-700"
                                    >
                                      <div className="col-span-2 font-medium">
                                        {it.item_number || idx + 1}
                                      </div>
                                      <div className="col-span-4 font-mono">
                                        {it.hs8_code || "-"}
                                      </div>
                                      <div className="col-span-6">
                                        {it.product_description || "-"}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {hasSearched && !loading && !error && !isValid && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  Certificate is not available for this reference number.
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

