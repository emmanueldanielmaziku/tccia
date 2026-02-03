"use client";
import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../employees/components/StatsBar";
import { Add, CloseCircle, MoreCircle, SearchNormal1, Refresh } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import AddOfficerForm from "./components/AddOfficerForm";
import { useRightSidebar } from "../../../contexts/RightSidebarContext";
import { useApiWithSessionHandling } from "../../../hooks/useApiWithSessionHandling";
import { handleSessionError } from "../../../utils/sessionErrorHandler";

interface SelectedCompany {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code?: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_role?: string;
  account_active: boolean;
  hire_date?: string;
  modules?: Array<{
    module_id: number;
    module_name: string;
    permissions: string[];
  }>;
}

export default function EmployeesManagement() {
  const { isRightSidebarOpen } = useRightSidebar();
  const { fetchWithSessionHandling } = useApiWithSessionHandling();
  const [addEmployeeForm, setAddEmployeeForm] = useState(false);
  const [discardBoxState, setDiscardBoxState] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const activeCount = useMemo(
    () => employees.filter((e) => e.account_active).length,
    [employees]
  );
  const inactiveCount = useMemo(
    () => employees.filter((e) => !e.account_active).length,
    [employees]
  );

  const statusLabel = (active: boolean) => (active ? "Active" : "Inactive");
  const statusBadgeClass = (active: boolean) =>
    active
      ? "bg-green-50 text-green-600 border-green-300"
      : "bg-gray-100 text-gray-500 border-gray-200";

  const fetchEmployees = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem("selectedCompany");
      if (!stored) {
        setSelectedCompany(null);
        setEmployees([]);
        setTotalPages(1);
        setTotalRecords(0);
        setError("No company selected. Please select a company first.");
        return;
      }

      const parsed: SelectedCompany = JSON.parse(stored);
      setSelectedCompany(parsed);

      const res = await fetchWithSessionHandling(
        `/api/manager/employees?company_id=${encodeURIComponent(
          String(parsed.id)
        )}&page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(
          String(itemsPerPage)
        )}`,
        { method: "GET" }
      );

      const data = await res.json();

      if (!res.ok) {
        setEmployees([]);
        setTotalPages(1);
        setTotalRecords(0);
        setError(data?.error || "Failed to fetch employees.");
        return;
      }

      const list: Employee[] = Array.isArray(data?.employees) ? data.employees : [];
      setEmployees(list);
      setTotalPages(Number(data?.pagination?.total_pages) || 1);
      setTotalRecords(Number(data?.pagination?.total_records) || list.length);
      setCurrentPage(Number(data?.pagination?.current_page) || page);
    } catch (err) {
      if (handleSessionError(err)) return;
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
    const handleCompanyChange = () => {
      setCurrentPage(1);
      fetchEmployees(1);
    };
    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
    window.addEventListener("storage", handleCompanyChange);
    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
      window.removeEventListener("storage", handleCompanyChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When pagination changes (e.g., clicking next/prev), refetch that page.
    fetchEmployees(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter((e) => {
      return (
        (e.name || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q) ||
        (e.user_role || "").toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

    return (
        <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
            {discardBoxState && (
                <AlertBox
                    onConfirm={() => {
                        setDiscardBoxState(false), setAddEmployeeForm(false);
                    }}
                    onCancel={() => setDiscardBoxState(false)}
                />
            )}
            <NavBar title={"Employees Management"} />

            {/* Content */}
            <section className="flex flex-row">
                <div className="flex flex-col items-center flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
                    <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-16.5">
                        {/* Header */}
                        <div className="flex flex-row w-full justify-between items-center my-1">
                            {addEmployeeForm ? (
                                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                                    Add Employee
                                </div>
                            ) : (
                                <div className="flex flex-row gap-3 items-center">
                                  <label className="flex justify-center items-center relative">
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-sm pl-8 pr-2.5 py-2.5 text-sm placeholder:text-sm"
                                    />
                                    <SearchNormal1
                                        size="18"
                                        color="gray"
                                        className="absolute left-3"
                                    />
                                  </label>
                                  <button
                                    className="flex flex-row gap-2 justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-[6px] cursor-pointer px-4 py-2.5"
                                    onClick={() => fetchEmployees(currentPage)}
                                    disabled={loading}
                                  >
                                    <Refresh
                                      size="18"
                                      color={loading ? "#9CA3AF" : "#4B5563"}
                                      className={loading ? "animate-spin" : ""}
                                    />
                                    {loading ? "Refreshing..." : "Refresh"}
                                  </button>
                                </div>
                            )}

                            {/* button */}
                            {addEmployeeForm ? (
                                <button
                                    className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2.5"
                                    onClick={() => {
                                        setDiscardBoxState(true);
                                    }}
                                >
                                    <CloseCircle size={20} color="red" />
                                    Close
                                </button>
                            ) : (
                                <button
                                    className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2.5"
                                    onClick={() => setAddEmployeeForm(true)}
                                >
                                    <Add size={20} color="white" />
                                    Add Employee
                                </button>
                            )}
                        </div>
                        {/* Main */}
                        {addEmployeeForm ? (
                            <div className="w-full flex items-center justify-center h-full">
                                <AddOfficerForm
                                  onSuccess={() => {
                                    setAddEmployeeForm(false);
                                    setCurrentPage(1);
                                    fetchEmployees(1);
                                  }}
                                />
                            </div>
                        ) : (
                            <div className="w-full mt-5 rounded-md border-[0.5px] overflow-hidden overflow-y-auto h-[100%]">
                              {loading ? (
                                <div className="p-6 text-gray-600 text-sm">Loading employees...</div>
                              ) : error ? (
                                <div className="p-6 text-red-500 text-sm">{error}</div>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      <th className="px-4 py-5 text-left text-gray-700">S/N</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Full Name</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Email</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Phone</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Role</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Company</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Status</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredEmployees.map((employee, index) => (
                                      <tr
                                        key={employee.id}
                                        className={`hover:bg-gray-100 transition-colors border-t-[0.5px] rounded-[12px] text-gray-700 border-zinc-200 ${
                                          index % 2 === 0 ? "bg-white" : "bg-gray-white"
                                        }`}
                                      >
                                        <td className="px-4 py-4">
                                          {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-4 py-4">{employee.name}</td>
                                        <td className="px-4 py-4">{employee.email}</td>
                                        <td className="px-4 py-4">{employee.phone || "-"}</td>
                                        <td className="px-4 py-4">{employee.user_role || "-"}</td>
                                        <td className="px-4 py-4">
                                          <span className="inline-block bg-blue-50 text-blue-600 rounded px-2 py-0.5 mr-1 text-xs border border-blue-100">
                                            {selectedCompany?.company_name || "-"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4">
                                          <span
                                            className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] ${statusBadgeClass(
                                              employee.account_active
                                            )}`}
                                          >
                                            {statusLabel(employee.account_active)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4">
                                          <button className="w-full flex items-center justify-center cursor-pointer">
                                            <MoreCircle color="gray" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                      <tr>
                                        <td className="px-4 py-8 text-center text-gray-500" colSpan={8}>
                                          No employees found.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              )}
                            </div>
                        )}

                        {/* Pagination */}
                        {addEmployeeForm ? null : (
                            <div className="flex justify-between items-center mt-4 bg-white/35 backdrop-blur-md w-full">
                                <span className="text-gray-600">
                                    Page {currentPage} of {totalPages} ({totalRecords} total)
                                </span>

                                <div className="flex flex-row justify-between items-center gap-8">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-6 py-1.5 text-sm rounded ${
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
                                        className={`px-6 py-1.5 text-sm rounded ${
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
                
                {isRightSidebarOpen && (
                  <ProgressTracker
                    stats={{
                      total: totalRecords,
                      active: activeCount,
                      inactive: inactiveCount,
                    }}
                    onCompanyChange={() => {
                      setCurrentPage(1);
                      fetchEmployees(1);
                    }}
                  />
                )}
               
            </section>
            {/* End of Content */}
        </main>
    );
}
