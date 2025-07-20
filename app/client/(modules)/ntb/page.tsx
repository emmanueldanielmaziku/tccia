"use client";
import NavBar from "../../components/NavBar";
import ProgressTracker from "./components/StatsBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ClipboardCheck,
  AlertCircle,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const TANZANIA_REGIONS = [
  "Arusha",
  "Dar es Salaam",
  "Dodoma",
  "Geita",
  "Iringa",
  "Kagera",
  "Katavi",
  "Kigoma",
  "Kilimanjaro",
  "Lindi",
  "Manyara",
  "Mara",
  "Mbeya",
  "Morogoro",
  "Mtwara",
  "Mwanza",
  "Njombe",
  "Pemba North",
  "Pemba South",
  "Pwani",
  "Rukwa",
  "Ruvuma",
  "Shinyanga",
  "Simiyu",
  "Singida",
  "Tabora",
  "Tanga",
  "Zanzibar North",
  "Zanzibar South",
  "Zanzibar West",
];

export default function NTB() {
  const t = useTranslations("ntb");
  const [mode, setMode] = useState<"none" | "report" | "track">("none");
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_contact: "",
    subject: "",
    description: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [successData, setSuccessData] = useState<{
    tracking_code: string;
  } | null>(null);
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: form.description,
    onUpdate: ({ editor }) => {
      handleChange("description", editor.getHTML());
    },
  });

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessData(null);

    try {
      const response = await fetch("/api/ntb/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit report");
      }

      const trackingCode = result.data?.tracking_code || "NTB-" + Date.now();
      setSuccessData({ tracking_code: trackingCode });

      setForm({
        reporter_name: "",
        reporter_contact: "",
        subject: "",
        description: "",
        location: "",
      });
      editor?.commands.setContent("");

      toast.success("NTB report submitted successfully!");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);
    setIsTracking(true);

    try {
      const response = await fetch(
        `/api/ntb/feedback?tracking_code=${encodeURIComponent(trackId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setTrackError("No report found with that tracking code.");
        } else {
          throw new Error(result.error || "Failed to fetch report feedback");
        }
        return;
      }

      setTrackResult(result);
      toast.success("Report feedback fetched successfully!");
    } catch (error) {
      console.error("Error fetching report feedback:", error);
      setTrackError(
        error instanceof Error
          ? error.message
          : "Failed to fetch report feedback"
      );
    } finally {
      setIsTracking(false);
    }
  };

  const handleTrackButtonClick = () => {
    setMode("track");
    // Add a small delay to show the transition effect
    setTimeout(() => {
      // Focus on the tracking input field
      const trackInput = document.getElementById("track_id");
      if (trackInput) {
        trackInput.focus();
      }
    }, 100);
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 ml-2 shadow-sm relative">
      <NavBar title={t("title")} />
      <section className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-col items-start flex-1 w-full overflow-y-auto max-h-[calc(97vh-80px)]">
          <div className="w-full max-w-4xl mx-auto mt-24 mb-8 px-6 pb-8">
            {mode === "none" && (
              <div className="flex flex-col gap-8 items-center text-center">
                <div className="text-center space-y-10">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
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
                        {t("reportNTBIssue")}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {t("reportNTBIssueDesc")}
                      </p>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 cursor-pointer rounded-[9px] transition-all duration-200 group-hover:scale-105"
                        size="lg"
                        onClick={() => setMode("report")}
                      >
                        {t("createReport")}
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
                        {t("trackNTBHeading")}
                      </h3>
                      <p className="text-gray-600 mb-6">{t("trackNTBDesc")}</p>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-6 cursor-pointer rounded-[9px] transition-all duration-200 group-hover:scale-105"
                        size="lg"
                        onClick={handleTrackButtonClick}
                      >
                        {t("trackReport")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Report Form */}
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
                          {t("reportNTBIssue")}
                        </CardTitle>
                        <CardDescription className="text-[14px]">
                          {t("reportNTBIssueDesc")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    {successData ? (
                      <div className="text-center space-y-8">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {t("reportSubmittedSuccess")}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {t("reportSubmittedDesc")}
                          </p>
                          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                              {t("trackingCode")}:
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xl px-6 py-3 font-mono bg-blue-100 text-blue-800 border-blue-200"
                            >
                              {successData.tracking_code}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                          <Button
                            variant="outline"
                            className="flex-1 py-3 rounded-[9px]"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                successData.tracking_code
                              );
                              toast.success("Tracking code copied!");
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            {t("copyCode")}
                          </Button>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl"
                            onClick={() => setMode("none")}
                          >
                            {t("backToHome")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleReportSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label
                              htmlFor="reporter_name"
                              className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              {t("yourName")}
                            </Label>
                            <Input
                              id="reporter_name"
                              placeholder={t("enterYourName")}
                              value={form.reporter_name}
                              onChange={(e) =>
                                handleChange("reporter_name", e.target.value)
                              }
                              className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="reporter_contact"
                              className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4" />
                              {t("contactNumber")}
                            </Label>
                            <Input
                              id="reporter_contact"
                              placeholder={t("enterContactNumber")}
                              value={form.reporter_contact}
                              onChange={(e) =>
                                handleChange("reporter_contact", e.target.value)
                              }
                              className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="subject"
                            className="text-sm font-medium text-gray-700"
                          >
                            {t("issueSubject")}
                          </Label>
                          <Input
                            id="subject"
                            placeholder={t("e.g.,DelayInClearingCargoAtPort")}
                            value={form.subject}
                            onChange={(e) =>
                              handleChange("subject", e.target.value)
                            }
                            className="h-12 rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="description"
                            className="text-sm font-medium text-gray-700"
                          >
                            {t("detailedDescription")}
                          </Label>
                          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                            <div className="flex gap-1 border-b border-gray-100 px-4 py-3 bg-gray-50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  editor?.chain().focus().toggleBold().run()
                                }
                                className={`h-8 w-8 p-0 rounded-[9px] ${
                                  editor?.isActive("bold")
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Bold className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  editor?.chain().focus().toggleItalic().run()
                                }
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  editor?.isActive("italic")
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Italic className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  editor
                                    ?.chain()
                                    .focus()
                                    .toggleBulletList()
                                    .run()
                                }
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  editor?.isActive("bulletList")
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <List className="w-4 h-4" />
                              </Button>
                            </div>
                            <EditorContent
                              editor={editor}
                              className="min-h-[140px] px-4 py-3 focus:outline-none prose prose-sm max-w-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="location"
                            className="text-sm font-medium text-gray-700 flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            {t("location")}
                          </Label>
                          <Select
                            value={form.location}
                            onValueChange={(value) =>
                              handleChange("location", value)
                            }
                            required
                          >
                            <SelectTrigger className="h-12 py-6 cursor-pointer w-full rounded-[9px] border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder={t("selectRegion")} />
                            </SelectTrigger>
                            <SelectContent>
                              {TANZANIA_REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator className="my-8" />

                        <div className="flex gap-4">
                          <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-[9px] cursor-pointer h-12"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                {t("submitting")}
                              </>
                            ) : (
                              t("submitReport")
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-[9px] cursor-pointer h-12"
                            onClick={() => setMode("none")}
                            disabled={isSubmitting}
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Track Form */}
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
                          {t("trackNTBReport")}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {t("trackNTBDesc")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <form onSubmit={handleTrackSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="track_id"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          {t("trackingCode")}
                        </Label>
                        <Input
                          id="track_id"
                          placeholder={t("e.g.,NTB-0001")}
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          className="h-12 rounded-[9px] border-gray-200 focus:border-green-500 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium cursor-pointer py-3 rounded-[9px] h-12"
                          disabled={isTracking}
                        >
                          {isTracking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              {t("tracking")}
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4 mr-2" />
                              {t("trackReport")}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-gray-200 text-gray-700 cursor-pointer hover:bg-gray-50 py-3 rounded-[9px] h-12"
                          onClick={() => setMode("none")}
                        >
                          {t("cancel")}
                        </Button>
                      </div>

                      {trackError && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-red-700">
                            {trackError}
                          </span>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Display result if found */}
                {trackResult && trackResult.success && (
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900">
                        {t("reportDetails")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6 max-h-[60vh] overflow-y-auto">
                      {trackResult.data?.reports?.map(
                        (report: any, idx: number) => (
                          <div key={idx} className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                    {report.subject}
                                  </h4>
                                  <div
                                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: report.description,
                                    }}
                                  />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                      {t("location")}:
                                    </span>
                                    <span className="text-gray-600">
                                      {report.location}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                      {t("reporter")}:
                                    </span>
                                    <span className="text-gray-600">
                                      {report.reporter_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                      {t("contact")}:
                                    </span>
                                    <span className="text-gray-600">
                                      {report.reporter_contact}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-700">
                                      {t("trackingCode")}:
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="font-mono bg-blue-100 text-blue-800 border-blue-300"
                                    >
                                      {report.tracking_code}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-700">
                                    {t("status")}:
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                  >
                                    {report.state || report.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {report.feedback_messages && (
                              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {t("feedbackUpdates")}
                                </h5>
                                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border">
                                  {report.feedback_messages}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Handle single report response */}
                      {trackResult.data && !trackResult.data.reports && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                                  {trackResult.data.subject}
                                </h4>
                                <div
                                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: trackResult.data.description,
                                  }}
                                />
                              </div>

                              <Separator />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">
                                    {t("location")}:
                                  </span>
                                  <span className="text-gray-600">
                                    {trackResult.data.location}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">
                                    {t("reporter")}:
                                  </span>
                                  <span className="text-gray-600">
                                    {trackResult.data.reporter_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">
                                    {t("contact")}:
                                  </span>
                                  <span className="text-gray-600">
                                    {trackResult.data.reporter_contact}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-gray-700">
                                    {t("trackingCode")}:
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="font-mono bg-blue-100 text-blue-800 border-blue-300"
                                  >
                                    {trackResult.data.tracking_code}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-700">
                                  {t("status")}:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                >
                                  {trackResult.data.state ||
                                    trackResult.data.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {trackResult.data.feedback_messages && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {t("feedbackUpdates")}
                              </h5>
                              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border">
                                {trackResult.data.feedback_messages}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
        <ProgressTracker />
      </section>
    </main>
  );
}
