"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type React from "react";

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

export default function CertificateValidityModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpstreamJsonRpc["result"] | null>(
    null
  );
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset when closing so the next open is fresh.
      setReferenceNumber("");
      setLoading(false);
      setError(null);
      setResult(null);
      setHasSearched(false);
    }
  }, [open]);

  const messageInfo = result?.message_info;
  const isValid = !!messageInfo && !error;

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber.trim());
    } catch (err) {
      console.error("Copy reference failed:", err);
    }
  };

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

  const canSubmit = useMemo(
    () => !loading && !!referenceNumber.trim(),
    [loading, referenceNumber]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="shadow-none bg-white/95 border border-gray-200 p-0 sm:max-w-4xl"
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
              Certificate Validity Check
            </DialogTitle>
            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-[520px]">
              Enter a certificate reference number to verify its availability.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
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
                  disabled={!canSubmit}
                  className="w-full sm:w-[220px] cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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

              </div>
            )}

            {hasSearched && !loading && !error && !isValid && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Certificate is not available for this reference number.
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

