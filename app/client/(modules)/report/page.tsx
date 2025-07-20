"use client";
import NavBar from "../../components/NavBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  FileText,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  MapPin,
  ClipboardCheck,
  Headphones,
  Info,
  Clock,
} from "lucide-react";
import StatsBar from "./components/StatsBar";
import { useTranslations } from "next-intl";

export default function HelpdeskReport() {
  const t = useTranslations("helpdesk");
  const [mode, setMode] = useState<"none" | "report" | "track">("none");
  const [services, setServices] = useState<any[]>([]);
  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [issueCategory, setIssueCategory] = useState<string>("");
  const [issueCategories, setIssueCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    customer_name: "",
    customer_phone: "",
    service_category: "",
    issue_category: "",
    priority: "normal",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://tccia.kalen.co.tz";

  useEffect(() => {
    fetch(`${BASE_URL}/api/helpdesk/services`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        }
      });
  }, []);

  useEffect(() => {
    const svc = services.find((s) => s.code === serviceCategory);
    setIssueCategories(svc?.issue_categories || []);
    setIssueCategory("");
    setForm((prev) => ({
      ...prev,
      service_category: serviceCategory,
      issue_category: "",
    }));
  }, [serviceCategory, services]);

  // Update form when issue category changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, issue_category: issueCategory }));
  }, [issueCategory]);

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function isValidPhone(phone: string) {
    // Accepts + followed by 9-15 digits
    return /^\+\d{9,15}$/.test(phone);
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);
    setSubmitError(null);

    if (!isValidPhone(form.customer_phone)) {
      setSubmitError(
        "Invalid phone number format. Use international format, e.g., +255123456789"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      // Check for nested result
      const res = result.result || result;
      if (!res.success)
        throw new Error(res.error || res.message || "Submission failed");
      setSubmitResult(res);
      setForm({
        subject: "",
        description: "",
        customer_name: "",
        customer_phone: "",
        service_category: "",
        issue_category: "",
        priority: "normal",
        location: "",
      });
      setServiceCategory("");
      setIssueCategory("");
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    setTrackResult(null);
    setTrackError(null);
    try {
      const response = await fetch(`/api/helpdesk/track/${trackId}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Tracking failed");
      setTrackResult(result.ticket);
    } catch (err: any) {
      setTrackError(err.message || "Tracking failed");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title={t("title")} />
      <section className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-col items-start flex-1 w-full overflow-y-auto max-h-[calc(97vh-80px)]">
          <div className="w-full max-w-4xl mx-auto mt-24 mb-8 px-6 pb-8">
            {/* Welcome Section */}
            {mode === "none" && (
              <div className="flex flex-col gap-8 items-center text-center">
                <div className="text-center space-y-10">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Headphones className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {t("welcome")}
                    </h1>
                    <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
                      {t("intro")}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10 w-full max-w-3xl">
                  <Card className="group hover:shadow-lg transition-all duration-300 border-[0.5px] shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {t("submitRequest")}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t("submitRequestDesc")}
                      </p>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 cursor-pointer rounded-[9px] transition-all duration-200 group-hover:scale-105"
                        size="lg"
                        onClick={() => setMode("report")}
                      >
                        {t("reportProblem")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-[0.5px] shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                        <Search className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {t("trackReport")}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t("trackReportDesc")}
                      </p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-6 cursor-pointer rounded-[9px] transition-all duration-200 group-hover:scale-105"
                        size="lg"
                        onClick={() => setMode("track")}
                      >
                        {t("trackReport")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Submit Ticket Form */}
            {mode === "report" && (
              <div className="space-y-6">
                <Card className="border-[0.5px] shadow-sm bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {t("submitTicketTitle")}
                        </CardTitle>
                        <CardDescription className="text-[14px]">
                          {t("submitTicketDesc")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    {submitResult && (
                      <div className="text-center space-y-8">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {t("ticketSubmitted")}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {t("ticketSubmittedDesc")}
                          </p>
                          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                              {t("yourTicketNumber")}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xl px-6 py-3 font-mono bg-blue-100 text-blue-800 border-blue-200"
                            >
                              {submitResult.ticket_number}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                          <Button
                            variant="outline"
                            className="flex-1 py-3 rounded-[9px]"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                submitResult.ticket_number
                              );
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            {t("copyNumber")}
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl"
                            onClick={() => setMode("none")}
                          >
                            {t("backToHome")}
                          </Button>
                        </div>
                      </div>
                    )}
                    {submitError && (
                      <div className="flex flex-row items-center gap-2 mb-6 text-red-600">
                        <AlertCircle className="w-5 h-5" /> {submitError}
                      </div>
                    )}
                    {/* Form fields */}
                    <form onSubmit={handleReportSubmit} className="space-y-7">
                      {/* Name & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            <User className="w-4 h-4 mr-1 inline" />
                            {t("customerName")}
                          </Label>
                          <Input
                            value={form.customer_name}
                            onChange={(e) =>
                              handleFormChange("customer_name", e.target.value)
                            }
                            placeholder={t("customerName")}
                            required
                            className="py-3 px-4 rounded-lg border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            <Phone className="w-4 h-4 mr-1 inline" />
                            {t("customerPhone")}
                          </Label>
                          <Input
                            value={form.customer_phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d+]/g, "");
                              handleFormChange("customer_phone", val);
                            }}
                            placeholder="e.g. +255123456789"
                            required
                            className="py-3 px-4 rounded-lg border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label className="font-medium text-gray-700">
                          <Info className="w-4 h-4 mr-1 inline" />
                          {t("subject")}
                        </Label>
                        <Input
                          value={form.subject}
                          onChange={(e) =>
                            handleFormChange("subject", e.target.value)
                          }
                          placeholder={t("subject")}
                          required
                          className="py-3 px-4 rounded-lg border-gray-300"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="font-medium text-gray-700">
                          <FileText className="w-4 h-4 mr-1 inline" />
                          {t("description")}
                        </Label>
                        <textarea
                          className="w-full border rounded-lg px-4 py-3 min-h-[100px] border-gray-300"
                          value={form.description}
                          onChange={(e) =>
                            handleFormChange("description", e.target.value)
                          }
                          placeholder={t("description")}
                          required
                        />
                      </div>

                      {/* Dropdowns: Service, Issue, Priority, Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            {t("serviceCategory")}
                          </Label>
                          <Select
                            value={serviceCategory}
                            onValueChange={(v) => setServiceCategory(v)}
                            required
                          >
                            <SelectTrigger className="py-3 px-4 rounded-lg border-gray-300">
                              <SelectValue placeholder={t("selectService")} />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((svc) => (
                                <SelectItem key={svc.code} value={svc.code}>
                                  {svc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            {t("issueCategory")}
                          </Label>
                          <Select
                            value={issueCategory}
                            onValueChange={(v) => setIssueCategory(v)}
                            required
                            disabled={!serviceCategory}
                          >
                            <SelectTrigger className="py-3 px-4 rounded-lg border-gray-300">
                              <SelectValue placeholder={t("selectIssue")} />
                            </SelectTrigger>
                            <SelectContent>
                              {issueCategories.map((cat) => (
                                <SelectItem key={cat.code} value={cat.code}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            {t("priority")}
                          </Label>
                          <Select
                            value={form.priority}
                            onValueChange={(v) =>
                              handleFormChange("priority", v)
                            }
                          >
                            <SelectTrigger className="py-3 px-4 rounded-lg border-gray-300">
                              <SelectValue placeholder={t("selectPriority")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t("low")}</SelectItem>
                              <SelectItem value="normal">
                                {t("normal")}
                              </SelectItem>
                              <SelectItem value="high">{t("high")}</SelectItem>
                              <SelectItem value="urgent">
                                {t("urgent")}
                              </SelectItem>
                              <SelectItem value="critical">
                                {t("critical")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">
                            {t("location")}
                          </Label>
                          <Input
                            value={form.location}
                            onChange={(e) =>
                              handleFormChange("location", e.target.value)
                            }
                            placeholder={t("location")}
                            className="py-3 px-4 rounded-lg border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8">
                        <Button
                          type="submit"
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t("submitting") : t("submitTicket")}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-8 py-3 rounded-lg"
                          onClick={() => setMode("none")}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Track Ticket Form */}
            {mode === "track" && (
              <div className="space-y-6">
                <Card className="border-[0.5px] shadow-sm bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Search className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-900">
                          {t("trackTicketTitle")}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("trackTicketDesc")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <form onSubmit={handleTrackSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label>
                          <Clock className="w-4 h-4 mr-1 inline" />
                          {t("ticketNumber")}
                        </Label>
                        <Input
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          placeholder="e.g. GEN-0007"
                          required
                        />
                      </div>
                      <div className="flex gap-4 mt-6">
                        <Button
                          type="submit"
                          className="bg-green-600 text-white px-8"
                          disabled={isTracking}
                        >
                          {isTracking ? t("tracking") : t("trackTicket")}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setMode("none")}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                      {trackError && (
                        <div className="flex flex-row items-center gap-2 mt-6 text-red-600">
                          <AlertCircle className="w-5 h-5" /> {trackError}
                        </div>
                      )}
                    </form>
                    {trackResult && (
                      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="text-green-500 w-6 h-6" />
                          <span className="text-blue-800 font-semibold">
                            {t("ticketFound")}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">{t("subject")}:</span>{" "}
                          {trackResult.subject}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">{t("status")}:</span>{" "}
                          {trackResult.status_description || trackResult.status}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("priority")}:
                          </span>{" "}
                          {trackResult.priority}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">{t("service")}:</span>{" "}
                          {trackResult.service_name}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">{t("issue")}:</span>{" "}
                          {trackResult.issue_category_name}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("customer")}:
                          </span>{" "}
                          {trackResult.customer_name}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("location")}:
                          </span>{" "}
                          {trackResult.location}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("submitted")}:
                          </span>{" "}
                          {new Date(
                            trackResult.submission_date
                          ).toLocaleString()}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("lastUpdated")}:
                          </span>{" "}
                          {new Date(trackResult.last_updated).toLocaleString()}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">
                            {t("description")}:
                          </span>{" "}
                          <span className="whitespace-pre-line">
                            {trackResult.description}
                          </span>
                        </div>
                        {trackResult.latest_communication && (
                          <div className="mt-4 p-4 bg-white border rounded-md">
                            <div className="font-semibold text-blue-700 mb-1">
                              {t("latestCommunication")}
                            </div>
                            <div className="text-gray-700 whitespace-pre-line">
                              {trackResult.latest_communication}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        {/* Right sidebar */}
        <StatsBar />
      </section>
    </main>
  );
}
