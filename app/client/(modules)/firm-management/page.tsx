"use client";
import { useState, useEffect, useMemo } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../firm-management/components/StatsBar";
import {
  Add,
  ArchiveBook,
  Box,
  Building,
  CloseCircle,
  SearchNormal1,
  Refresh,
} from "iconsax-reactjs";

import AlertBox from "../factory-verification/components/AlertBox";
import FirmRegForm from "./components/FirmRegForm";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usetinFormState from "../../services/companytinformState";
import { useRightSidebar } from "../../../contexts/RightSidebarContext";

type Company = {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code: string;
  company_registration_type_code: string;
  company_fax_number: string;
  company_postal_base_address: string;
  company_postal_detail_address: string;
  company_physical_address: string;
  company_email: string;
  company_postal_code: string;
  company_telephone_number: string;
  company_description: string;
  state: string;
};

export default function FirmManagement() {
  const { tinformState, toggleCompanyTinForm } = usetinFormState();
  const { isRightSidebarOpen } = useRightSidebar();
  const [discardBoxState, togglediscardBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "tin" | "state">("tin");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<{ [tin: string]: number }>(
    {}
  );
  const [certificateCounts, setCertificateCounts] = useState<{
    [tin: string]: number;
  }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [nationalityFilter, setNationalityFilter] = useState("__all__");
  const [registrationTypeFilter, setRegistrationTypeFilter] =
    useState("__all__");
  const [stateFilter, setStateFilter] = useState("__all__");

  const fetchCompanies = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    setProductCounts({});
    setCertificateCounts({});
    try {
      const response = await fetch("/api/companies/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.status === "success" && data.data?.companies) {
        setCompanies(data.data.companies);
      } else {
        setError(data.message || "Failed to fetch companies");
      }
    } catch (err) {
      setError("Failed to fetch companies");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (companies.length === 0) return;

    companies.forEach((company) => {
      fetch("/api/products/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_tin: company.company_tin }),
      })
        .then((res) => res.json())
        .then((data) => {
          setProductCounts((prev) => ({
            ...prev,
            [company.company_tin]: data.product_count || 0,
          }));
        });

      fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party_tin: company.company_tin }),
      })
        .then((res) => res.json())
        .then((data) => {
          setCertificateCounts((prev) => ({
            ...prev,
            [company.company_tin]: data.result?.data?.length || 0,
          }));
        });
    });
  }, [companies]);

  // Unique options for dropdowns
  const nationalityOptions = useMemo(
    () => [
      ...new Set(
        companies
          .map((c) => c.company_nationality_code)
          .filter((v) => !!v && v !== "")
      ),
    ],
    [companies]
  );
  const registrationTypeOptions = useMemo(
    () => [
      ...new Set(
        companies
          .map((c) => c.company_registration_type_code)
          .filter((v) => !!v && v !== "")
      ),
    ],
    [companies]
  );
  const stateOptions = useMemo(
    () => [
      ...new Set(companies.map((c) => c.state).filter((v) => !!v && v !== "")),
    ],
    [companies]
  );

  const filteredData = companies
    .filter((company) => {
      const matchesSearch =
        company.company_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        company.company_tin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.company_physical_address
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        company.state.toLowerCase() === statusFilter.toLowerCase();

      const matchesNationality =
        nationalityFilter === "__all__" ||
        company.company_nationality_code === nationalityFilter;
      const matchesRegistrationType =
        registrationTypeFilter === "__all__" ||
        company.company_registration_type_code === registrationTypeFilter;
      const matchesState =
        stateFilter === "__all__" || company.state === stateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesNationality &&
        matchesRegistrationType &&
        matchesState
      );
    })
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.company_name.localeCompare(b.company_name)
          : b.company_name.localeCompare(a.company_name);
      } else if (sortField === "tin") {
        return sortDirection === "asc"
          ? a.company_tin.localeCompare(b.company_tin)
          : b.company_tin.localeCompare(a.company_tin);
      } else {
        return sortDirection === "asc"
          ? a.state.localeCompare(b.state)
          : b.state.localeCompare(a.state);
      }
    });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const submittedCount = companies.filter(
    (company) => company.state === "Submitted"
  ).length;

  const approvedCount = companies.filter(
    (company) => company.state === "approved"
  ).length;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <main className="w-full h-[97vh] rounded-[12px] sm:rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      {discardBoxState && (
        <AlertBox
          onConfirm={() => {
            togglediscardBox(false), toggleCompanyTinForm();
          }}
          onCancel={() => togglediscardBox(false)}
        />
      )}

      <NavBar title={"Firm Registration"} />

      {/* Content */}
      <section className="flex flex-col lg:flex-row flex-1">
        <div className="flex flex-col items-start flex-1 min-w-0 h-[97vh] pt-16 sm:pt-18 bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-start items-start mt-2 w-full h-[86vh] rounded-sm relative px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-4 lg:gap-6 my-1">
              {tinformState ? (
                <div className="font-semibold antialiased text-sm sm:text-base lg:text-[18px] text-zinc-600">
                  Add New Company
                </div>
              ) : (
                <>
                  {/* Search and Filters Section */}
                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-2 w-full lg:w-auto">
                    <label className="flex justify-center items-center w-full lg:w-auto relative">
                      <input
                        type="text"
                        placeholder="Search firms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full lg:w-auto border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-[8px] sm:rounded-[9px] pl-5 sm:pl-6 lg:pl-8 pr-2 sm:pr-2.5 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                      />
                      <SearchNormal1
                        size="14"
                        className="absolute left-1.5 sm:left-2 lg:left-3 w-4 h-4 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]"
                        color="gray"
                      />
                    </label>

                    {/* State Filter */}
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-full lg:w-[140px] text-zinc-600 text-xs sm:text-sm py-1 sm:py-1.5 lg:py-2">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="__all__">All States</SelectItem>
                          {stateOptions.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      className={`flex flex-row h-[32px] sm:h-[35px] gap-1 sm:gap-2 items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-[5px] sm:rounded-[6px] cursor-pointer px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 w-full sm:w-auto border border-gray-300 ${
                        refreshing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      onClick={fetchCompanies}
                      disabled={refreshing}
                      title="Refresh companies list"
                    >
                      <Refresh
                        size={16}
                        className={`sm:w-[18px] sm:h-[18px] ${refreshing ? "animate-spin" : ""}`}
                        color="#36568a"
                      />
                      <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
                      <span className="sm:hidden">{refreshing ? "..." : "↻"}</span>
                    </button>
                    <button
                      className="flex flex-row gap-1 sm:gap-2 md:gap-3 justify-center items-center bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm rounded-[5px] sm:rounded-[6px] cursor-pointer px-2 sm:px-3 md:px-5 h-[32px] sm:h-[35px] w-full sm:w-auto"
                      onClick={() => toggleCompanyTinForm()}
                    >
                      <Add size="16" className="w-4 h-4 sm:w-5 sm:h-5" color="white" />
                      <span className="hidden sm:inline">Add Company</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </>
              )}

              {/* Close button for form state */}
              {tinformState && (
                <button
                  className="flex flex-row gap-3 justify-center items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => {
                    togglediscardBox(true);
                  }}
                >
                  <CloseCircle size={20} color="red" />
                  Close
                </button>
              )}
            </div>

            {/* Main */}
            {loading || refreshing ? (
              <div className="w-full grid grid-cols-1 pr-2 sm:pr-3 gap-3 sm:gap-5 mt-4 sm:mt-5 rounded-md overflow-hidden overflow-y-auto">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-gray-100 flex flex-col border-[0.5px] rounded-[7px] border-zinc-300 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-[0.5] border-zinc-200 p-4 gap-2">
                      <div className="h-4 sm:h-5 w-32 bg-gray-300 rounded mb-2" />
                      <div className="h-5 sm:h-6 w-20 bg-gray-300 rounded" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 bg-gray-50">
                      <div className="border-[0.5px] bg-blue-50 border-blue-200 py-2 sm:py-3 md:py-4 rounded-[12px] px-2 sm:px-3 md:px-4 flex items-center">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 rounded-full" />
                      </div>
                      <div className="w-full flex flex-col gap-1 justify-start">
                        <div className="h-3 sm:h-4 w-40 bg-gray-300 rounded" />
                        <div className="h-2 sm:h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-2 sm:h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col gap-3 px-3 sm:px-4 pb-3 sm:pb-4 bg-gray-50 rounded-b-md">
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="h-3 sm:h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-3 sm:h-4 w-10 bg-gray-200 rounded" />
                        </div>
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="h-3 sm:h-4 w-48 bg-gray-200 rounded" />
                          <div className="h-3 sm:h-4 w-10 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tinformState ? (
              <FirmRegForm onCompanyAdded={fetchCompanies} />
            ) : companies.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center w-full h-full min-h-[400px] mt-0">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Building size={32} color="#9CA3AF" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Companies Found
                </h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  It seems you have not registered any companies yet. Start by
                  adding your first company to get started.
                </p>
                <button
                  onClick={() => toggleCompanyTinForm()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md transition-colors"
                >
                  <Add size={20} color="white" />
                  Add Your First Company
                </button>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="w-full grid grid-cols-1 pr-2 sm:pr-3 gap-3 sm:gap-5 mt-4 sm:mt-5 rounded-md overflow-hidden overflow-y-auto">
                {paginatedData.map((firm, index) => (
                  <div
                    key={index}
                    className="hover:bg-white bg-gray-100 flex flex-col transition-colors border-[0.5px] rounded-[7px] text-gray-700 border-zinc-300 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b-[0.5px] border-zinc-200 p-3 sm:p-4 gap-2">
                      <div className="font-semibold text-sm sm:text-base md:text-lg break-words">{`${
                        index + 1
                      }. ${firm.company_name}`}</div>
                      <div
                        className={`border-[0.5px] text-xs sm:text-sm rounded-[30px] px-2 sm:px-3 py-1 self-start sm:self-auto ${
                          firm.state == "approved"
                            ? "bg-green-100 border-green-300 text-green-600"
                            : "bg-red-100 border-red-300 text-red-600"
                        }`}
                      >
                        {firm.state.charAt(0).toUpperCase() +
                          firm.state.slice(1)}
                      </div>
                    </div>
                    {/* Company Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-4 gap-3 bg-gray-50">
                      <div className="border-[0.5px] bg-blue-50 border-blue-200 py-2 sm:py-3 md:py-4 rounded-[10px] sm:rounded-[12px] px-2 sm:px-3 md:px-4 flex items-center self-start">
                        <Building variant="Bulk" size={24} className="sm:w-8 sm:h-8" color="#138abd" />
                      </div>
                      <div className="w-full flex flex-col gap-1 justify-start min-w-0">
                        <div className="font-semibold text-sm sm:text-base break-words">
                          {firm.company_name}
                        </div>
                        <div className="text-xs sm:text-sm break-words text-gray-600">
                          {firm.company_physical_address}
                        </div>
                        <div className="text-blue-600 text-xs sm:text-sm break-all font-mono">
                          {firm.company_tin}
                        </div>
                      </div>
                    </div>
                    {/* Stats */}
                    <div>
                      <div className="flex flex-col gap-3 px-3 sm:px-4 pb-3 sm:pb-4 bg-gray-50 rounded-b-md">
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="flex flex-row justify-start items-center gap-1 min-w-0 flex-1">
                            <Box size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" color="#36568a" />
                            <span className="text-xs sm:text-sm truncate">Total Products</span>
                          </div>
                          <div className="hidden sm:block flex-1 mx-2 sm:mx-4 border-t border-dashed border-zinc-400 h-0" />
                          <div className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">
                            {productCounts[firm.company_tin] !== undefined ? (
                              productCounts[firm.company_tin]
                            ) : (
                              <span className="text-gray-400">...</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="flex flex-row justify-start items-center gap-1 min-w-0 flex-1">
                            <ArchiveBook size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" color="#36568a" />
                            <span className="text-xs sm:text-sm truncate">
                              Total Certificates of Origin
                            </span>
                          </div>
                          <div className="hidden sm:block flex-1 mx-2 sm:mx-4 border-t border-dashed border-zinc-400 h-0" />
                          <div className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">
                            {certificateCounts[firm.company_tin] !==
                            undefined ? (
                              certificateCounts[firm.company_tin]
                            ) : (
                              <span className="text-gray-400">...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {tinformState ? null : (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-4 bg-white/35 backdrop-blur-md w-full p-3 sm:p-4">
                <span className="text-sm sm:text-base text-gray-600 order-2 sm:order-1">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex flex-row justify-between items-center gap-3 sm:gap-4 sm:gap-8 order-1 sm:order-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-4 md:px-6 py-1.5 text-xs sm:text-sm rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">←</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-4 md:px-6 py-1.5 text-xs sm:text-sm rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isRightSidebarOpen && (
          <ProgressTracker
            stats={{
              total: companies.length,
              submitted: submittedCount,
              approved: approvedCount,
            }}
          />
        )}
      </section>
    </main>
  );
}
