"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Flag,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: number;
  report_reference: string;
  ntb_type: {
    id: number;
    name: string;
  };
  date_of_incident: string;
  reporting_country: {
    id: number;
    name: string;
    code: string;
  };
  reported_country: {
    id: number;
    name: string;
    code: string;
  };
  location: string;
  location_of_incidence: {
    id: number;
    name: string;
    country: {
      id: number;
      name: string;
      code: string;
    };
  };
  specific_location: {
    id: number;
    name: string;
    code: string;
    country: {
      id: number;
      name: string;
      code: string;
    };
  };
  complaint_details: string;
  product_description: string;
  hs_code: string;
  hs_description: string;
  cost_value_range: string;
  state: string;
  has_submitted_resolution: boolean;
  assignment_resolution_remarks: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  login: string;
}

interface ResolutionData {
  report: Report;
  user: User;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  review: "Review (Focal Persons)",
  assignment: "In Progress",
  in_progress: "In Progress",
  "in progress": "In Progress",
  intended_resolved: "Intended Resolved",
  unintended_resolved: "Unintended Resolved",
  resolved: "Resolved",
  done: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assignment: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  "in progress": "bg-purple-100 text-purple-800 border-purple-200",
  intended_resolved: "bg-green-100 text-green-800 border-green-200",
  unintended_resolved: "bg-orange-100 text-orange-800 border-orange-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  done: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

function ResolutionContent() {
  const params = useParams();
  const router = useRouter();
  const user_id = params?.user_id as string;
  const record_id = params?.record_id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<ResolutionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState("");

  useEffect(() => {
    if (!user_id || !record_id) {
      setError("Missing required parameters: user_id and record_id are required");
      setLoading(false);
      return;
    }

    fetchResolutionData();
  }, [user_id, record_id]);

  const fetchResolutionData = async () => {
    if (!user_id || !record_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ntb/resolution/${user_id}/${record_id}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch resolution data");
      }

      setData(result.data);
      
      // Pre-fill resolution remarks if already submitted
      if (result.data?.report?.assignment_resolution_remarks) {
        setResolutionRemarks(result.data.report.assignment_resolution_remarks);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch resolution data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user_id || !record_id) {
      toast.error("Missing required parameters");
      return;
    }

    if (!resolutionRemarks.trim()) {
      toast.error("Please provide resolution remarks");
      return;
    }

    if (data?.report.has_submitted_resolution) {
      toast.error("You have already submitted a resolution for this NTB");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/ntb/resolution/${user_id}/${record_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution_remarks: resolutionRemarks.trim(),
        }),
      });

      // Parse response (API always returns JSON)
      const result = await response.json();

      // Check for errors
      if (!response.ok || !result.success) {
        const errorMessage = result.error || result.message || `Server error: ${response.status} ${response.statusText}`;
        console.error("Resolution submission error:", {
          status: response.status,
          statusText: response.statusText,
          result
        });
        throw new Error(errorMessage);
      }

      toast.success(result.message || "Resolution submitted successfully!");
      
      // Refresh data to show updated state
      await fetchResolutionData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit resolution";
      console.error("Resolution submission error:", err);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || "Failed to load resolution data"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { report, user } = data;
  const statusLabel = STATUS_LABELS[report.state] || report.state;
  const statusColor = STATUS_COLORS[report.state] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NTB Resolution</h1>
            <p className="text-muted-foreground mt-1">
              Submit resolution for {report.report_reference}
            </p>
          </div>
          <Badge className={`${statusColor} border`}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Details
            </CardTitle>
            <CardDescription>Non-Tariff Barrier Information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Reference</p>
                  <p className="text-base font-semibold">{report.report_reference}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">NTB Type</p>
                  <p className="text-base">{report.ntb_type.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Date of Incident</p>
                  <p className="text-base">{formatDate(report.date_of_incident)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Flag className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Reporting Country</p>
                  <p className="text-base">{report.reporting_country.name} ({report.reporting_country.code})</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Flag className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Reported Country</p>
                  <p className="text-base">{report.reported_country.name} ({report.reported_country.code})</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base">{report.location}</p>
                  {report.location_of_incidence && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.location_of_incidence.name}, {report.location_of_incidence.country.name}
                    </p>
                  )}
                  {report.specific_location && (
                    <p className="text-sm text-muted-foreground">
                      {report.specific_location.name} ({report.specific_location.code})
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Complaint Details</p>
                  <p className="text-base whitespace-pre-wrap">{report.complaint_details}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Product Description</p>
                  <p className="text-base">{report.product_description}</p>
                  {report.hs_code && (
                    <p className="text-sm text-muted-foreground mt-1">
                      HS Code: {report.hs_code}
                    </p>
                  )}
                  {report.hs_description && (
                    <p className="text-sm text-muted-foreground">
                      {report.hs_description}
                    </p>
                  )}
                </div>
              </div>

              {report.cost_value_range && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Cost Value Range</p>
                      <p className="text-base">{report.cost_value_range}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Responsible User
            </CardTitle>
            <CardDescription>User assigned to this NTB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base font-semibold">{user.name}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base">{user.phone}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Login</p>
                  <p className="text-base">{user.login}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Form Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {report.has_submitted_resolution ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            Resolution Submission
          </CardTitle>
          <CardDescription>
            {report.has_submitted_resolution
              ? "You have already submitted a resolution for this NTB"
              : "Provide your resolution remarks for this NTB"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution_remarks">
                Resolution Remarks <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="resolution_remarks"
                placeholder="Enter your resolution remarks here. Provide detailed information about how the issue was resolved or addressed..."
                value={resolutionRemarks}
                onChange={(e) => setResolutionRemarks(e.target.value)}
                disabled={report.has_submitted_resolution || submitting}
                rows={8}
                className="resize-none"
                required
              />
              <p className="text-sm text-muted-foreground">
                Please provide a detailed explanation of the resolution or actions taken.
              </p>
            </div>

            {report.has_submitted_resolution && (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Resolution Already Submitted
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    You cannot submit another resolution for this NTB.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={report.has_submitted_resolution || submitting || !resolutionRemarks.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : report.has_submitted_resolution ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Already Submitted
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Resolution
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Resolution() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <ResolutionContent />
    </Suspense>
  );
}

