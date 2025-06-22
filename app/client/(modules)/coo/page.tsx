"use client";
import { useState, useEffect, useRef } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "./components/StatsBar";
import NewCertificateModal from "./components/NewCertificateModal";
import {
  Add,
  CloseCircle,
  DocumentText,
  Eye,
  Printer,
  Refresh,
  SearchNormal1,
} from "iconsax-reactjs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import COOForm from "./components/COOForm";
import { useRouter } from "next/navigation";

import usePickerState from "../../services/PickerState";

export default function COO() {
  const [verificationForm, toggleForm] = useState(false);
  const [isNewCertificateModalOpen, setIsNewCertificateModalOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [certificateData, setCertificateData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { togglePicker, hidePicker } = usePickerState();
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    const handleCompanyChange = () => {
      handleRefresh();
    };

    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
    return () =>
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
  }, []);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        setError("No company selected. Please select a company first.");
        setIsLoading(false);
        hidePicker();
        return;
      }

      const { company_tin } = JSON.parse(selectedCompany);

      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          party_tin: company_tin,
        }),
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/auth");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.result?.status === "success") {
        const transformedData = result.result.data.map((cert: any) => ({
          message_info: {
            // Certificate Details
            certificate_type_id: cert.application_number,
            application_uuid: cert.application_uuid,
            organization_code: cert.organization_code,
            application_degree: cert.application_degree,
            application_type_code: cert.application_type_code,
            application_classification_code:
              cert.application_classification_code,
            application_state_code: cert.application_state_code,
            status: cert.status.charAt(0).toUpperCase() + cert.status.slice(1),

            // Header Information
            interface_id: cert.header[0]?.interface_id || "",
            sender_id: cert.header[0]?.sender_id || "",
            receiver_id: cert.header[0]?.receiver_id || "",
            reference_number: cert.header[0]?.reference_number || "",
            ucr_number: cert.header[0]?.ucr_number || "",
            approval_date_and_time: cert.header[0]?.send_date_and_time || "",

            // Party Information
            party_uuid: cert.party[0]?.party_uuid || "",
            party_type_code: cert.party[0]?.party_type_code || "",
            party_country_code: cert.party[0]?.party_country_code || "",

            // Exporter Information
            exporter_tin: cert.party[0]?.party_tin || "",
            exporter_name: cert.party[0]?.party_name || "",
            exporter_address: cert.party[0]?.party_physical_address || "",
            exporter_telephone_number:
              cert.party[0]?.party_contact_officer_telephone_number || "",
            exporter_email_address:
              cert.party[0]?.party_contact_officer_email || "",

            // Consignee Information
            consignee_tin: cert.party[0]?.party_tin || "",
            consignee_name: cert.party[0]?.party_name || "",
            consignee_address: cert.party[0]?.party_physical_address || "",

            // Applicant Information
            applicant_name: cert.party[0]?.party_contact_officer_name || "",
            applicant_address: cert.party[0]?.party_physical_address || "",

            // Additional Information
            issue_country_code: cert.party[0]?.party_country_code || "",
            destination_country_code: "",
            application_place_name: "",
            approver_name: "",

            // Transport and Other Details
            transport_particulars_contents: "",
            transport_particulars_content: "",
            remark: "",
            electronic_certicate_of_origin_treatment_contents: "",

            // Additional Arrays
            item_info: cert.item || [],
            transport: cert.transport || [],
            invoice: cert.invoice || [],
            attachment: cert.attachment || [],
          },
        }));
        setCertificateData(transformedData);
      } else {
        console.error("API Error:", result);
        setError(result.result?.message || "Failed to fetch certificates");
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          "Network error: Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Error fetching certificates"
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter and sort the data
  const filteredData = certificateData
    .filter((certificate) => {
      const matchesSearch =
        certificate.message_info.consignee_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        certificate.message_info.exporter_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        certificate.message_info.certificate_type_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        certificate.message_info.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (dateSort === "newest") {
        return (
          new Date(b.message_info.approval_date_and_time).getTime() -
          new Date(a.message_info.approval_date_and_time).getTime()
        );
      } else {
        return (
          new Date(a.message_info.approval_date_and_time).getTime() -
          new Date(b.message_info.approval_date_and_time).getTime()
        );
      }
    });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewCertificate = (certificate: any) => {
    setSelectedCertificate(certificate);
    toggleForm(true);
  };

  const handlePrintCertificate = (aid: string) => {
    const certificateUrl = `http://159.65.191.145:8050/certificate_of_origin/static/certificate/EAC/index.html?id=${aid}`;
    window.open(certificateUrl, "_blank");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCertificates();
  };

  const submittedCount = certificateData.filter(
    (certificate) => certificate.message_info.status === "Submitted"
  ).length;

  const approvedCount = certificateData.filter(
    (certificate) => certificate.message_info.status === "Approved"
  ).length;

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title={"Certificate of Origin"} />

      {/* Content */}
      <section className="flex flex-col lg:flex-row">
        <div className="flex flex-col items-start flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-start items-start mt-2 w-full h-[86vh] rounded-sm relative px-4 md:px-8 lg:px-16.5">
            {/* Header */}
            <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 mb-5">
              {verificationForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600 pl-3">
                  {selectedCertificate
                    ? "Certificate Preview"
                    : "Certificate of Origin List"}
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
                  <label className="flex justify-center items-center w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Search Certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-auto border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-[9px] pl-8 pr-2.5 py-2 text-sm placeholder:text-[13px]"
                    />
                    <SearchNormal1
                      size="18"
                      color="gray"
                      className="absolute left-6 md:left-19"
                    />
                  </label>

                  <div className="flex flex-row gap-5 justify-between items-center w-full">
                    {/* Status Filter */}
                    <div className="relative w-full md:w-auto">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-full md:w-[140px] text-zinc-600">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Sort */}
                    <div className="relative w-full md:w-auto">
                      <Select value={dateSort} onValueChange={setDateSort}>
                        <SelectTrigger className="w-full md:w-[140px] text-zinc-600">
                          <SelectValue placeholder="Sort by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* button */}
              {verificationForm ? (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => {
                    toggleForm(false);
                  }}
                >
                  <CloseCircle size={20} color="red" />
                  Close
                </button>
              ) : (
                <div className="flex flex-row gap-4 w-full md:w-auto">
                  <button
                    className="flex flex-row gap-3 justify-between items-center border-[0.5px] border-gray-400 hover:bg-blue-100 text-gray-500 text-sm rounded-[7px] cursor-pointer px-5 py-1.5 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <Refresh
                      size={18}
                      color={isRefreshing ? "#9CA3AF" : "#4B5563"}
                      className={`transition-transform duration-1000 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    className="flex flex-row gap-3 justify-between items-center border-[0.5px] border-blue-600 hover:bg-blue-100 text-blue-600 text-sm rounded-[7px] cursor-pointer px-3 py-1.5 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsNewCertificateModalOpen(true)}
                  >
                    <Add size={20} color="#1376e8" />
                    New Certificate
                  </button>
                </div>
              )}
            </div>

            {/* Main */}
            {verificationForm ? (
              <COOForm certificateData={selectedCertificate} />
            ) : (
              <div className="w-full grid grid-cols-1 pr-0 gap-4 mt-5 rounded-md overflow-hidden overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-100 rounded-[10px] border border-zinc-200 shadow-sm p-6 flex flex-col gap-4"
                      >
                        <div className="flex flex-row items-center gap-4">
                          <div className="bg-blue-200 rounded-xl h-10 w-10" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full" />
                        </div>
                        <div className="flex flex-row gap-4">
                          <div className="h-8 w-32 bg-gray-200 rounded" />
                          <div className="h-8 w-32 bg-gray-200 rounded" />
                        </div>
                        <div className="flex flex-row justify-between items-center">
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                          <div className="h-4 w-24 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col justify-center items-center mt-20 mb-32 text-gray-500">
                    <img
                      src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4c4.png"
                      alt="No Certificates"
                      className="w-16 h-16 mb-4 opacity-70"
                    />
                    <div className="text-lg font-semibold mb-1">
                      No Certificates Found
                    </div>
                    <div className="text-sm text-gray-400 mb-3 text-center">
                      You have not created or received any certificates yet.
                    </div>
                    <button
                      className="flex flex-row gap-2 items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md shadow transition"
                      onClick={() => setIsNewCertificateModalOpen(true)}
                    >
                      <Add size={18} color="white" />
                      Create New Certificate
                    </button>
                  </div>
                ) : paginatedData.length === 0 ? (
                  <div className="flex flex-col justify-center items-center mt-20 mb-32 text-gray-500">
                    <img
                      src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4c4.png"
                      alt="No Certificates"
                      className="w-16 h-16 mb-4 opacity-70"
                    />
                    <div className="text-lg font-semibold mb-1">
                      No Certificates Found
                    </div>
                    <div className="text-sm text-gray-400 mb-3 text-center">
                      You have not created or received any certificates yet.
                    </div>
                    <button
                      className="flex flex-row gap-2 items-center bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md shadow transition"
                      onClick={() => setIsNewCertificateModalOpen(true)}
                    >
                      <Add size={18} color="white" />
                      Create New Certificate
                    </button>
                  </div>
                ) : (
                  paginatedData.map((certificate, index) => (
                    <div
                      key={index}
                      className={`hover:bg-white bg-gray-50 flex flex-col transition-all duration-200 border-[0.5px] rounded-[10px] text-gray-700 border-zinc-200 shadow-sm hover:shadow-md`}
                    >
                      <div className="flex flex-row justify-between items-center border-b-[0.5px] border-zinc-200 px-6 py-3 gap-2">
                        <div className="font-semibold text-[15px]">{`${
                          index + 1
                        }. ${certificate.message_info.consignee_name}`}</div>
                        <div
                          className={`border-[0.5px] text-sm rounded-[30px] px-4 py-1 ${
                            certificate.message_info.status === "Approved"
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-orange-50 border-orange-200 text-orange-600"
                          }`}
                        >
                          {certificate.message_info.status}
                        </div>
                      </div>
                      {/* header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="border-[0.5px] bg-blue-50 border-blue-200 py-3 sm:py-4 rounded-[12px] px-3 sm:px-4 flex items-center self-start">
                            <DocumentText
                              variant="Bulk"
                              size={36}
                              color="#138abd"
                            />
                          </div>

                          <div className="w-full flex flex-col gap-1 justify-start">
                            <div className="font-semibold text-[15px]">
                              {certificate.message_info.exporter_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {certificate.message_info.exporter_address}
                            </div>
                            <div className="text-blue-600 text-[12px] font-medium">
                              {certificate.message_info.exporter_tin}
                            </div>

                            <div>
                              <span className="text-[13px] text-gray-600">
                                Control number: 3451726382932
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row justify-between items-center gap-3 md:gap-4">
                          <button
                            onClick={() => handleViewCertificate(certificate)}
                            className="px-4 md:px-5 py-1.5 text-sm rounded-[6px] flex flex-row justify-center items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer transition-colors duration-200"
                          >
                            <Eye size="16" color="white" />
                            Application
                          </button>
                          <button
                            // disabled={true}
                            onClick={() =>
                              handlePrintCertificate(
                                certificate.message_info.application_uuid
                              )
                            }
                            className="px-4 md:px-5 py-1.5 text-sm rounded-[6px] flex flex-row justify-center items-center gap-2 bg-blue-500 text-white cursor-pointer"
                          >
                            <Printer size="16" color="white" />
                            Print
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-col gap-3 px-6 pb-6 bg-gray-50 rounded-b-md">
                          <div className="flex flex-row w-full justify-between items-start md:items-center gap-2">
                            <div className="flex flex-row justify-start items-center gap-1">
                              <span className="text-[14px] text-gray-600">
                                Issued Country
                              </span>
                            </div>
                            <div className="hidden md:block flex-1 mx-4 border-t-1 border-dashed border-zinc-300 h-0" />
                            <div className="flex flex-row gap-2 text-sm items-center">
                              ({certificate.message_info.issue_country_code})
                              <img
                                src={`https://flagsapi.com/${certificate.message_info.issue_country_code}/flat/24.png`}
                                className="rounded-sm"
                              />
                            </div>
                          </div>
                          <div className="flex flex-row w-full justify-between items-start md:items-center gap-2">
                            <div className="flex flex-row justify-start items-center gap-1">
                              <span className="text-[14px] text-gray-600">
                                Destination Country
                              </span>
                            </div>
                            <div className="hidden md:block flex-1 mx-4 border-t-1 border-dashed border-zinc-300 h-0" />
                            <div className="flex flex-row gap-2 text-sm items-center">
                              (UG
                              {/* {
                                certificate.message_info
                                  .destination_country_code
                              } */}
                              )
                              {/* <img
                                src={`https://flagsapi.com/${certificate.message_info.destination_country_code}/flat/24.png`}
                                className="rounded-sm"
                              /> */}
                              <img
                                src={`https://flagsapi.com/UG/flat/24.png`}
                                className="rounded-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {(!verificationForm || totalPages > 1) && (
              <div className="flex flex-row justify-between items-center gap-4 mt-4 bg-white/35 backdrop-blur-md w-full p-4">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex flex-row justify-between items-center gap-4 md:gap-8">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 md:px-6 py-1.5 text-sm rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 md:px-6 py-1.5 text-sm rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ProgressTracker
          stats={{
            total: certificateData.length,
            submitted: submittedCount,
            approved: approvedCount,
          }}
          onCompanyChange={handleRefresh}
        />
      </section>
      <NewCertificateModal
        isOpen={isNewCertificateModalOpen}
        onClose={() => setIsNewCertificateModalOpen(false)}
      />
    </main>
  );
}
