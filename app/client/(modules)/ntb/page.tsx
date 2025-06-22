"use client";
import NavBar from "../../components/NavBar";
import ProgressTracker from "./components/StatsBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Bold, Italic, List, ClipboardCheck } from "lucide-react";
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
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessData({ tracking_code: "NTB-0011" });
      setForm({
        reporter_name: "",
        reporter_contact: "",
        subject: "",
        description: "",
        location: "",
      });
      editor?.commands.setContent("");
    }, 1200);
   
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackResult(null);
   
    setTimeout(() => {
      if (trackId === "NTB-0001") {
        setTrackResult({
          status: "success",
          data: {
            reports: [
              {
                subject: "Delay in clearing cargo",
                description:
                  "Our goods have been stuck at the port for more than two weeks without a clear explanation.",
                reporter_name: "Ali Mwinyi",
                reporter_contact: "+255689123456",
                location: "Arusha",
                tracking_code: "NTB-0001",
                state: "submitted",
                feedback_messages:
                  "Status: submitted\nFeedback (EN): Your report has been successfully submitted and is awaiting review.\nFeedback (SW): Ripoti yako imewasilishwa kwa mafanikio na inasubiri kupitiwa.\nBy: TCCIA\nDate: 2025-06-18 13:49",
              },
            ],
          },
        });
      } else {
        setTrackError("No report found with that tracking code.");
      }
    }, 1200);
    // In real use, POST to your API and handle response.
  };

  return (
    <main className="flex flex-col w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 relative">
      <NavBar title={"Report & Track NTB Issues"} />
      <section className="flex flex-1 flex-col lg:flex-row h-full">
        <div className="flex flex-col items-start flex-1 w-full border-transparent border-[1px] rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="w-full max-w-xl mx-auto mt-16 mb-8 px-4">
            {/* Welcome & Mode Selection */}
            {mode === "none" && (
              <div className="flex flex-col gap-6 items-center text-center">
                <h2 className="text-3xl font-bold text-blue-900">
                  Welcome to NTB Reporting Portal
                </h2>
                <p className="text-gray-600 text-lg">
                  Here you can easily report a Non-Tariff Barrier (NTB) issue or
                  track the status of a report you submitted previously.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition"
                    onClick={() => setMode("report")}
                  >
                    Report NTB Issue
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-700 font-semibold px-8 py-3 rounded-lg text-lg transition"
                    onClick={() => setMode("track")}
                  >
                    Track NTB Issue
                  </Button>
                </div>
              </div>
            )}

            {/* Report Form */}
            {mode === "report" && (
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-blue-900">
                    Report NTB Issue
                  </h2>
                  <p className="text-gray-600">
                    Fill in the form below to report your NTB issue. You will
                    receive a tracking code after submission.
                  </p>
                </div>
                {successData ? (
                  <div className="flex flex-col items-center justify-center gap-4 bg-green-50 border border-green-200 rounded-lg p-8">
                    <ClipboardCheck size={48} className="text-green-600" />
                    <div className="text-xl font-semibold text-green-800">
                      NTB report submitted successfully!
                    </div>
                    <div className="text-gray-700">
                      Your tracking code:
                      <span className="ml-2 font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {successData.tracking_code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          successData.tracking_code
                        );
                        toast.success("Tracking code copied!");
                      }}
                    >
                      Copy Tracking Code
                    </Button>
                    <Button className="mt-2" onClick={() => setMode("none")}>
                      Back to Home
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReportSubmit}
                    className="flex flex-col gap-8 w-full bg-white/90 rounded-xl border border-gray-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pt-8">
                      <div>
                        <Label
                          htmlFor="reporter_name"
                          className="text-gray-700 font-medium"
                        >
                          Your Name
                        </Label>
                        <Input
                          id="reporter_name"
                          placeholder="Fullname"
                          value={form.reporter_name}
                          onChange={(e) =>
                            handleChange("reporter_name", e.target.value)
                          }
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="reporter_contact"
                          className="text-gray-700 font-medium"
                        >
                          Contact
                        </Label>
                        <Input
                          id="reporter_contact"
                          placeholder="+255..."
                          value={form.reporter_contact}
                          onChange={(e) =>
                            handleChange("reporter_contact", e.target.value)
                          }
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>
                    <div className="px-8">
                      <Label
                        htmlFor="subject"
                        className="text-gray-700 font-medium"
                      >
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="Delay in clearing cargo"
                        value={form.subject}
                        onChange={(e) =>
                          handleChange("subject", e.target.value)
                        }
                        className="mt-2"
                        required
                      />
                    </div>
                    <div className="px-8">
                      <Label
                        htmlFor="description"
                        className="text-gray-700 font-medium"
                      >
                        Description
                      </Label>
                      <div className="mt-2 border rounded-lg bg-white">
                        {/* Toolbar */}
                        <div className="flex gap-2 border-b px-2 py-1 bg-gray-50 rounded-t-lg">
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleBold().run()
                            }
                            className={`p-1 rounded ${
                              editor?.isActive("bold")
                                ? "bg-blue-100 text-blue-700"
                                : ""
                            }`}
                            aria-label="Bold"
                          >
                            <Bold size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleItalic().run()
                            }
                            className={`p-1 rounded ${
                              editor?.isActive("italic")
                                ? "bg-blue-100 text-blue-700"
                                : ""
                            }`}
                            aria-label="Italic"
                          >
                            <Italic size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleBulletList().run()
                            }
                            className={`p-1 rounded ${
                              editor?.isActive("bulletList")
                                ? "bg-blue-100 text-blue-700"
                                : ""
                            }`}
                            aria-label="Bulleted List"
                          >
                            <List size={16} />
                          </button>
                        </div>
                        {/* Editor */}
                        <EditorContent
                          editor={editor}
                          className="min-h-[100px] px-3 py-2 outline-none"
                        />
                      </div>
                    </div>
                    <div className="px-8">
                      <Label
                        htmlFor="location"
                        className="text-gray-700 font-medium"
                      >
                        Location
                      </Label>
                      <Select
                        value={form.location}
                        onValueChange={(value) =>
                          handleChange("location", value)
                        }
                        required
                      >
                        <SelectTrigger className="mt-2 w-full">
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
                    <div className="px-8 pb-8 flex flex-row gap-4">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setMode("none")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Track Form */}
            {mode === "track" && (
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-blue-900">
                    Track NTB Issue
                  </h2>
                  <p className="text-gray-600">
                    Enter your tracking code below to view the status and
                    feedback of your NTB report.
                  </p>
                </div>
                <form
                  onSubmit={handleTrackSubmit}
                  className="flex flex-col gap-6 w-full bg-white/90 rounded-xl border border-gray-100 px-8 pt-8 pb-8"
                >
                  <Label
                    htmlFor="track_id"
                    className="text-gray-700 font-medium"
                  >
                    Tracking Code
                  </Label>
                  <Input
                    id="track_id"
                    placeholder="e.g. NTB-0001"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    className="mt-2"
                    required
                  />
                  <div className="flex flex-row gap-4">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-lg transition"
                    >
                      Track
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setMode("none")}
                    >
                      Cancel
                    </Button>
                  </div>
                  {trackError && (
                    <div className="text-red-600 text-center mt-2">
                      {trackError}
                    </div>
                  )}
                </form>
                {/* Display result if found */}
                {trackResult && trackResult.status === "success" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-2">
                    {trackResult.data.reports.map(
                      (report: any, idx: number) => (
                        <div key={idx} className="mb-4">
                          <div className="font-semibold text-blue-900 text-lg mb-1">
                            {report.subject}
                          </div>
                          <div
                            className="prose prose-sm text-gray-700 mb-2"
                            dangerouslySetInnerHTML={{
                              __html: report.description,
                            }}
                          />
                          <div className="text-gray-600 mb-1">
                            <span className="font-medium">Location:</span>{" "}
                            {report.location}
                          </div>
                          <div className="text-gray-600 mb-1">
                            <span className="font-medium">Reporter:</span>{" "}
                            {report.reporter_name} ({report.reporter_contact})
                          </div>
                          <div className="text-gray-600 mb-1">
                            <span className="font-medium">Tracking Code:</span>{" "}
                            {report.tracking_code}
                          </div>
                          <div className="text-gray-600 mb-1 capitalize">
                            <span className="font-medium">Status:</span>{" "}
                            {report.state}
                          </div>
                          <div className="bg-gray-100 rounded p-2 mt-2 whitespace-pre-line text-gray-700">
                            {report.feedback_messages}
                          </div>
                        </div>
                      )
                    )}
                  </div>
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
