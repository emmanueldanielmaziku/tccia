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
} from "lucide-react";
import { toast } from "sonner";

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
  const [mode, setMode] = useState<"none" | "report" | "track">("none");
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_contact: "",
    subject: "",
    description: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    }
  };

  return (
    <main className="flex flex-col w-full h-[97vh] rounded-[14px] overflow-hidden bg-background border border-border relative">
      <NavBar title={"Report & Track NTB Issues"} />
      <section className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-col items-start flex-1 w-full">
          <div className="w-full max-w-2xl mx-auto mt-40 mb-8 px-6">
            {/* Welcome & Mode Selection */}
            {mode === "none" && (
              <div className="flex flex-col gap-8 items-center text-center">
                <Card className="w-full max-w-md">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                      Welcome to NTB Reporting Portal
                    </CardTitle>
                    <CardDescription className="text-base">
                      Report Non-Tariff Barrier issues or track existing reports
                      with ease.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1"
                        size="lg"
                        onClick={() => setMode("report")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Report NTB Issue
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="lg"
                        onClick={() => setMode("track")}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Track NTB Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Report Form */}
            {mode === "report" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Report NTB Issue
                    </CardTitle>
                    <CardDescription>
                      Fill in the form below to report your NTB issue. You will
                      receive a tracking code after submission.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {successData ? (
                      <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900 mb-2">
                            NTB report submitted successfully!
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Your tracking code:
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-lg px-4 py-2 font-mono"
                          >
                            {successData.tracking_code}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                successData.tracking_code
                              );
                              toast.success("Tracking code copied!");
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Copy Tracking Code
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => setMode("none")}
                          >
                            Back to Home
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleReportSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="reporter_name">Your Name</Label>
                            <Input
                              id="reporter_name"
                              placeholder="Enter your full name"
                              value={form.reporter_name}
                              onChange={(e) =>
                                handleChange("reporter_name", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reporter_contact">Contact</Label>
                            <Input
                              id="reporter_contact"
                              placeholder="+255..."
                              value={form.reporter_contact}
                              onChange={(e) =>
                                handleChange("reporter_contact", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            placeholder="e.g., Delay in clearing cargo"
                            value={form.subject}
                            onChange={(e) =>
                              handleChange("subject", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <div className="border rounded-md bg-background">
                            <div className="flex gap-1 border-b px-3 py-2 bg-muted/50">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  editor?.chain().focus().toggleBold().run()
                                }
                                className={`h-8 w-8 p-0 ${
                                  editor?.isActive("bold") ? "bg-accent" : ""
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
                                className={`h-8 w-8 p-0 ${
                                  editor?.isActive("italic") ? "bg-accent" : ""
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
                                className={`h-8 w-8 p-0 ${
                                  editor?.isActive("bulletList")
                                    ? "bg-accent"
                                    : ""
                                }`}
                              >
                                <List className="w-4 h-4" />
                              </Button>
                            </div>
                            <EditorContent
                              editor={editor}
                              className="min-h-[120px] px-3 py-2 focus:outline-none prose prose-sm max-w-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Select
                            value={form.location}
                            onValueChange={(value) =>
                              handleChange("location", value)
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
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

                        <Separator />

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setMode("none")}
                            disabled={isSubmitting}
                          >
                            Cancel
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Get NTB Report Feedback
                    </CardTitle>
                    <CardDescription>
                      Enter your tracking code below to view the status and
                      feedback of your NTB report.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTrackSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="track_id">Tracking Code</Label>
                        <Input
                          id="track_id"
                          placeholder="e.g., NTB-0001"
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1">
                          <Search className="w-4 h-4 mr-2" />
                          Get Feedback
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setMode("none")}
                        >
                          Cancel
                        </Button>
                      </div>

                      {trackError && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-destructive">
                            {trackError}
                          </span>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Display result if found */}
                {trackResult && trackResult.success && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {trackResult.data?.reports?.map(
                        (report: any, idx: number) => (
                          <div key={idx} className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">
                                  {report.subject}
                                </h4>
                                <div
                                  className="prose prose-sm max-w-none text-muted-foreground"
                                  dangerouslySetInnerHTML={{
                                    __html: report.description,
                                  }}
                                />
                              </div>

                              <Separator />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium">Location:</span>
                                  <p className="text-muted-foreground">
                                    {report.location}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Reporter:</span>
                                  <p className="text-muted-foreground">
                                    {report.reporter_name}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Contact:</span>
                                  <p className="text-muted-foreground">
                                    {report.reporter_contact}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Tracking Code:
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {report.tracking_code}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <span className="font-medium text-sm">
                                  Status:
                                </span>
                                <Badge variant="secondary" className="ml-2">
                                  {report.state || report.status}
                                </Badge>
                              </div>
                            </div>

                            {report.feedback_messages && (
                              <div className="bg-background border rounded-lg p-4">
                                <h5 className="font-medium mb-2">
                                  Feedback & Updates
                                </h5>
                                <div className="whitespace-pre-line text-sm text-muted-foreground">
                                  {report.feedback_messages}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Handle single report response */}
                      {trackResult.data && !trackResult.data.reports && (
                        <div className="space-y-4">
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div>
                              <h4 className="font-semibold text-lg mb-2">
                                {trackResult.data.subject}
                              </h4>
                              <div
                                className="prose prose-sm max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                  __html: trackResult.data.description,
                                }}
                              />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium">Location:</span>
                                <p className="text-muted-foreground">
                                  {trackResult.data.location}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Reporter:</span>
                                <p className="text-muted-foreground">
                                  {trackResult.data.reporter_name}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Contact:</span>
                                <p className="text-muted-foreground">
                                  {trackResult.data.reporter_contact}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">
                                  Tracking Code:
                                </span>
                                <Badge variant="outline" className="font-mono">
                                  {trackResult.data.tracking_code}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-sm">
                                Status:
                              </span>
                              <Badge variant="secondary" className="ml-2">
                                {trackResult.data.state ||
                                  trackResult.data.status}
                              </Badge>
                            </div>
                          </div>

                          {trackResult.data.feedback_messages && (
                            <div className="bg-background border rounded-lg p-4">
                              <h5 className="font-medium mb-2">
                                Feedback & Updates
                              </h5>
                              <div className="whitespace-pre-line text-sm text-muted-foreground">
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
