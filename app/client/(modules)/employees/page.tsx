"use client";
import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../employees/components/StatsBar";
import { Add, CloseCircle, MoreCircle, SearchNormal1, Refresh, Edit, Eye, Lock, TickCircle } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import AddOfficerForm from "./components/AddOfficerForm";
import { useRightSidebar } from "../../../contexts/RightSidebarContext";
import { useApiWithSessionHandling } from "../../../hooks/useApiWithSessionHandling";
import { handleSessionError } from "../../../utils/sessionErrorHandler";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sms, Call, User, Building, Chart } from "iconsax-reactjs";

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
  active: boolean;
  hire_date?: string;
  modules?: Array<{
    module_id: number;
    module_name: string;
    permissions: string[];
  }>;
}

type Module = { id: number; name: string; code: string };
type Permission = { id: number; name: string; code: string };

export default function EmployeesManagement() {
  const formatError = (err: unknown) => {
    if (!err) return "An error occurred.";
    if (typeof err === "string") return err;
    if (typeof (err as any).message === "string") return (err as any).message;
    try {
      return JSON.stringify(err);
    } catch {
      return "An error occurred.";
    }
  };

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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modulePerms, setModulePerms] = useState<Record<number, string[]>>({});
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

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
        setError(formatError(data?.error) || "Failed to fetch employees.");
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

  const handleViewInfo = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDialog(true);
  };

  const loadModulesAndPermissions = async () => {
    if (modules.length && permissions.length) return;
    try {
      setLoadingMeta(true);
      const [modsRes, permsRes] = await Promise.all([
        fetch("/api/modules"),
        fetch("/api/permissions"),
      ]);
      const modsJson = await modsRes.json();
      const permsJson = await permsRes.json();
      // Filter out company_registration module
      const allModules = Array.isArray(modsJson?.modules) ? modsJson.modules : [];
      const filteredModules = allModules.filter(
        (module: Module) => module.code !== "company_registration"
      );
      setModules(filteredModules);
      setPermissions(Array.isArray(permsJson?.permissions) ? permsJson.permissions : []);
    } catch (err) {
      // keep silent; errors will surface on form if needed
    } finally {
      setLoadingMeta(false);
    }
  };

  const togglePermission = (moduleId: number, permCode: string) => {
    setModulePerms((prev) => {
      const current = new Set(prev[moduleId] || []);
      if (current.has(permCode)) current.delete(permCode);
      else current.add(permCode);
      return { ...prev, [moduleId]: Array.from(current) };
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
    });
    // preload module selections from current employee modules
    const mapped: Record<number, string[]> = {};
    (employee.modules || []).forEach((m) => {
      mapped[m.module_id] = m.permissions || [];
    });
    setModulePerms(mapped);
    setEditError(null);
    loadModulesAndPermissions();
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee || !selectedCompany?.id) {
      setEditError("No company or employee selected.");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetchWithSessionHandling("/api/manager/edit-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: editingEmployee.id,
          company_id: selectedCompany.id,
          name: editForm.name,
          // email and phone are locked in UI; we send the original values
          email: editingEmployee.email,
          phone: editingEmployee.phone || undefined,
          modules: Object.entries(modulePerms)
            .map(([moduleId, perms]) => ({
              module_id: Number(moduleId),
              permissions: perms,
            }))
            .filter((m) => Array.isArray(m.permissions)),
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.result?.error || data?.result?.success === false || data?.error) {
        setEditError(
          formatError(data?.result?.error || data?.error) || "Failed to update employee."
        );
        return;
      }
      setEditDialogOpen(false);
      toast.success("Employee updated successfully!");
      await fetchEmployees(currentPage);
    } catch (err) {
      setEditError(formatError(err) || "Network error while updating employee.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    if (!selectedCompany?.id) {
      toast.error("No company selected.");
      return;
    }
    
    setTogglingStatus(employee.id);
    try {
      const res = await fetchWithSessionHandling("/api/manager/toggle-employee-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.id,
          company_id: selectedCompany.id,
          active: !employee.active,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data?.result?.error || data?.result?.success === false || data?.error || data?.success === false) {
        toast.error(
          formatError(data?.result?.error || data?.error || data?.message) || "Failed to update employee status."
        );
        return;
      }
      
      toast.success(
        `Employee ${!employee.active ? "activated" : "deactivated"} successfully!`
      );
      await fetchEmployees(currentPage);
    } catch (err) {
      toast.error(formatError(err) || "Network error while updating employee status.");
    } finally {
      setTogglingStatus(null);
    }
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
            
            {/* Employee Details Dialog */}
            <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
              <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:!max-w-[600px] md:!max-w-[750px] lg:!max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Employee Details</DialogTitle>
                  <DialogDescription>
                    View complete information about this employee
                  </DialogDescription>
                </DialogHeader>
                {selectedEmployee && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={16} />
                          <span className="font-medium">Full Name</span>
                        </div>
                        <p className="text-gray-900 pl-6">{selectedEmployee.name}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Sms size={16} />
                          <span className="font-medium">Email Address</span>
                        </div>
                        <p className="text-gray-900 pl-6">{selectedEmployee.email || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Call size={16} />
                          <span className="font-medium">Phone Number</span>
                        </div>
                        <p className="text-gray-900 pl-6">{selectedEmployee.phone || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={16} />
                          <span className="font-medium">Role</span>
                        </div>
                        <p className="text-gray-900 pl-6">{selectedEmployee.user_role || "Not specified"}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Building size={16} />
                          <span className="font-medium">Company</span>
                        </div>
                        <p className="text-gray-900 pl-6">{selectedCompany?.company_name || "Not assigned"}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">Account Verified</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] inline-block ${statusBadgeClass(
                            selectedEmployee.account_active
                          )}`}
                        >
                          {selectedEmployee.account_active ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">Account Status</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] inline-block ${statusBadgeClass(
                            selectedEmployee.active ?? false
                          )}`}
                        >
                          {selectedEmployee.active ? "Active" : "Disabled"}
                        </span>
                      </div>
                      {/* {selectedEmployee.hire_date && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium">Hire Date</span>
                          </div>
                          <p className="text-gray-900 pl-6">
                            {new Date(selectedEmployee.hire_date).toLocaleDateString()}
                          </p>
                        </div>
                      )} */}
                    </div>
                    {selectedEmployee.modules && selectedEmployee.modules.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t">
                        <div className="text-sm font-medium text-gray-700">Module Access</div>
                        <div className="space-y-2">
                          {selectedEmployee.modules
                            .filter((module) => module.module_name !== "Company Registration")
                            .map((module) => (
                            <div key={module.module_id} className="pl-0">
                              <div className="font-medium text-sm text-gray-800 flex items-center gap-2"> <Lock size={16} /> {module.module_name}</div>
                              {module.permissions.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Permissions: {module.permissions.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Employee</DialogTitle>
                  <DialogDescription>
                    Update the employee details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Email (locked)</label>
                    <input
                      type="email"
                      value={editForm.email}
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Phone (locked)</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="border-t pt-3 mt-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                      <Chart size={16} />
                      Module Access
                    </div>
                    <p className="text-xs text-gray-600 mt-1 mb-2">
                      Select permissions to assign; leave all unchecked to remove access for that module.
                    </p>
                    {loadingMeta ? (
                      <div className="text-sm text-gray-500">Loading modules and permissions...</div>
                    ) : modules.length === 0 ? (
                      <div className="text-sm text-gray-500">No modules available.</div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                        {modules.map((m) => (
                          <div
                            key={m.id}
                            className="border border-zinc-200 rounded-md bg-white p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-800 text-sm">{m.name}</div>
                              <div className="text-xs text-gray-500">{m.code}</div>
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {permissions.map((p) => (
                                <div
                                  key={`${m.id}-${p.id}`}
                                  className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 rounded-md px-2 py-1 transition-colors"
                                >
                                  <Checkbox
                                    id={`edit-m-${m.id}-p-${p.id}`}
                                    checked={(modulePerms[m.id] || []).includes(p.code)}
                                    onCheckedChange={() => togglePermission(m.id, p.code)}
                                    className="cursor-pointer border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                  />
                                  <label
                                    htmlFor={`edit-m-${m.id}-p-${p.id}`}
                                    className="text-sm font-medium leading-none cursor-pointer hover:text-blue-600 transition-colors"
                                  >
                                    {p.name}
                                    <span className="text-xs text-gray-500 ml-2">({p.code})</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {editError && (
                    <div className="text-sm text-red-500">{editError}</div>
                  )}
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={editSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleSaveEdit}
                      disabled={editSubmitting}
                    >
                      {editSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

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
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      <th className="px-4 py-5 text-left text-gray-700">S/N</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Full Name</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Email</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Phone</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Account Status</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Array.from({ length: 10 }).map((_, index) => (
                                      <tr
                                        key={index}
                                        className="border-t-[0.5px] border-zinc-200 animate-pulse"
                                      >
                                        <td className="px-4 py-4">
                                          <div className="h-4 w-6 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                          <div className="h-5 w-5 bg-gray-200 rounded-full mx-auto"></div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : error ? (
                                <div className="p-6 text-red-500 text-sm">{formatError(error)}</div>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-200">
                                    <tr>
                                      <th className="px-4 py-5 text-left text-gray-700">S/N</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Full Name</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Email</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Phone</th>
                                      <th className="px-4 py-5 text-left text-gray-700">Account Status</th>
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
                                        <td className="px-4 py-4">
                                          <span
                                            className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] ${statusBadgeClass(
                                              employee.active ?? false
                                            )}`}
                                          >
                                            {employee.active ? "Active" : "Disabled"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-4">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <button className="w-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded p-1">
                                                <MoreCircle color="gray" />
                                              </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                              <DropdownMenuItem
                                                onClick={() => handleViewInfo(employee)}
                                                className="cursor-pointer"
                                              >
                                                <Eye size={16} className="mr-2" />
                                                View Info
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleEdit(employee)}
                                                className="cursor-pointer"
                                              >
                                                <Edit size={16} className="mr-2" />
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => handleToggleEmployeeStatus(employee)}
                                                className="cursor-pointer"
                                                disabled={togglingStatus === employee.id}
                                              >
                                                {employee.active ? (
                                                  <>
                                                    <Lock size={16} className="mr-2" />
                                                    Deactivate
                                                  </>
                                                ) : (
                                                  <>
                                                    <TickCircle size={16} className="mr-2" />
                                                    Activate
                                                  </>
                                                )}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </td>
                                      </tr>
                                    ))}
                                    {filteredEmployees.length === 0 && (
                                      <tr>
                                        <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                                          <div className="flex justify-center items-center">
                                            No employees found.
                                          </div>
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
