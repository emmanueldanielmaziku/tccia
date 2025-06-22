"use client";
import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../firm-management/components/StatsBar";
import {
  Add,
  ArchiveBook,
  Box,
  Building,
  CloseCircle,
  SearchNormal1,
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
  const [discardBoxState, togglediscardBox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "tin" | "state">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/companies/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      }
    };
    fetchCompanies();
  }, []);

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

      return matchesSearch && matchesStatus;
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
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 ml-2 shadow-sm relative">
      {discardBoxState && (
        <AlertBox
          onConfirm={() => {
            togglediscardBox(false), toggleCompanyTinForm();
          }}
          onCancel={() => togglediscardBox(false)}
        />
      )}

      <NavBar title={"Firm Management"} />

      {/* Content */}
      <section className="flex lg:flex-row">
        <div className="flex flex-col items-start flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-start items-start mt-2 w-full h-[86vh] rounded-sm relative px-4 md:px-8 lg:px-16.5">
            <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 my-1">
              {tinformState ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Add New Firm
                </div>
              ) : (
                <div className="flex flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <label className="flex justify-center items-center w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Search firms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-auto border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-[9px] pl-8 pr-2.5 py-2 text-sm placeholder:text-sm"
                    />
                    <SearchNormal1
                      size="18"
                      color="gray"
                      className="absolute left-6 md:left-19"
                    />
                  </label>

                  {/* Status Filter */}
                  <div className="flex flex-row">
                    <div className="relative w-full md:w-auto hidden">
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <div className="relative w-full md:w-auto">
                        <Select
                          value={sortField}
                          onValueChange={(value: "name" | "tin" | "state") => {
                            setSortField(value);
                            setCurrentPage(1); // Reset to first page when sorting
                          }}
                        >
                          <SelectTrigger className="w-full md:w-[140px] text-zinc-600">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="tin">TIN</SelectItem>
                              <SelectItem value="state">State</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort Direction Toggle */}
                      <button
                        onClick={() => {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          );
                          setCurrentPage(1); // Reset to first page when sorting
                        }}
                        className="px-3 py-2 text-sm border border-zinc-300 rounded-[9px] hover:bg-gray-50 transition-colors"
                        title={`Sort ${
                          sortDirection === "asc" ? "Descending" : "Ascending"
                        }`}
                      >
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* button */}
              {tinformState ? (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => {
                    togglediscardBox(true);
                  }}
                >
                  <CloseCircle size={20} color="red" />
                  Close
                </button>
              ) : (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => toggleCompanyTinForm()}
                >
                  <Add size={20} color="white" />
                  New Firm
                </button>
              )}
            </div>

            {/* Main */}
            {loading && (
              <div className="w-full grid grid-cols-1 pr-3 gap-5 mt-5 rounded-md overflow-hidden overflow-y-auto">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-gray-100 flex flex-col border-[0.5px] rounded-[7px] border-zinc-300 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[0.5] border-zinc-200 p-5 gap-2">
                      <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
                      <div className="h-6 w-20 bg-gray-300 rounded" />
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center p-5 gap-3 bg-gray-50">
                      <div className="border-[0.5px] bg-blue-50 border-blue-200 py-4 rounded-[12px] px-4 flex items-center">
                        <div className="h-9 w-9 bg-gray-300 rounded-full" />
                      </div>
                      <div className="w-full flex flex-col gap-1 justify-start">
                        <div className="h-4 w-40 bg-gray-300 rounded" />
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col gap-3 px-5 pb-5 bg-gray-50 rounded-b-md">
                        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-2">
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-4 w-10 bg-gray-200 rounded" />
                        </div>
                        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-2">
                          <div className="h-4 w-48 bg-gray-200 rounded" />
                          <div className="h-4 w-10 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && <div className="text-red-500">{error}</div>}
            {tinformState ? (
              <FirmRegForm />
            ) : (
              <div className="w-full grid grid-cols-1 pr-3 gap-5 mt-5 rounded-md overflow-hidden overflow-y-auto">
                {paginatedData.map((firm, index) => (
                  <div
                    key={index}
                    className="hover:bg-white bg-gray-100 flex flex-col transition-colors border-[0.5px] rounded-[7px] text-gray-700 border-zinc-300 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center border-b-[0.5px] border-zinc-200 p-4 gap-2">
                      <div className="font-semibold text-base sm:text-lg">{`${
                        index + 1
                      }. ${firm.company_name}`}</div>
                      <div
                        className={`border-[0.5px] text-xs sm:text-sm rounded-[30px] px-3 py-1 mt-2 sm:mt-0 ${
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-3 bg-gray-50">
                      <div className="border-[0.5px] bg-blue-50 border-blue-200 py-3 sm:py-4 rounded-[12px] px-3 sm:px-4 flex items-center self-start">
                        <Building variant="Bulk" size={32} color="#138abd" />
                      </div>
                      <div className="w-full flex flex-col gap-1 justify-start">
                        <div className="font-semibold text-base">
                          {firm.company_name}
                        </div>
                        <div className="text-sm break-words">
                          {firm.company_physical_address}
                        </div>
                        <div className="text-blue-600 text-sm break-all">
                          {firm.company_tin}
                        </div>
                      </div>
                    </div>
                    {/* Stats */}
                    <div>
                      <div className="flex flex-col gap-3 px-4 pb-4 bg-gray-50 rounded-b-md">
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="flex flex-row justify-start items-center gap-1">
                            <Box size={18} color="#36568a" />
                            <span className="text-[14px]">Total Products</span>
                          </div>
                          <div className="hidden sm:block flex-1 mx-4 border-t border-dashed border-zinc-400 h-0" />
                          <div className="text-sm">352</div>
                        </div>
                        <div className="flex flex-row w-full justify-between items-center gap-2">
                          <div className="flex flex-row justify-start items-center gap-1">
                            <ArchiveBook size={18} color="#36568a" />
                            <span className="text-[14px]">
                              Total Certificates of Origin
                            </span>
                          </div>
                          <div className="hidden sm:block flex-1 mx-4 border-t border-dashed border-zinc-400 h-0" />
                          <div className="text-sm">76</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {tinformState ? null : (
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 bg-white/35 backdrop-blur-md w-full p-4">
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
            total: companies.length,
            submitted: submittedCount,
            approved: approvedCount,
          }}
        />
      </section>
    </main>
  );
}
