"use client";
import { useState, useEffect, useMemo } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../factory-verification/components/StatsBar";
import FactoryVerificationForm from "../factory-verification/components/FactoryVerificationForm";
import {
  Add,
  CloseCircle,
  Eye,
  MoreCircle,
  SearchNormal1,
  Refresh,
  Box,
  More2,
} from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface Product {
  sn: number;
  id: number;
  product_name: string;
  hs_code: string;
  state: string;
  community_name: string | null;
  community_short_code: string | null;
  manufacturer?: string;
  verification_id: number;
  verification_reference: string;
  verification_state: string;
  description?: string;
}

const stateLabels = {
  draft: "Submitted",
  submitted: "Submitted",
  under_review: "Under Review",
  awaiting_director: "Awaiting Director",
  approved: "Approved",
  rejected: "Rejected",
  inspection_scheduled: "Inspection Scheduled",
  inspection_done: "Inspection Done",
  report_disputed: "Report Disputed",
  report_accepted: "Report Accepted",
  finalized: "Finalized",
};

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
    case "verified":
    case "report_accepted":
      return "bg-green-100 text-green-700";
    case "pending":
    case "draft":
    case "submitted":
    case "under_review":
    case "awaiting_director":
      return "bg-orange-100 text-orange-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "report_disputed":
      return "bg-red-100 text-red-700";
    case "inspection_scheduled":
    case "inspection_done":
    case "finalized":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function FactoryVerification() {
  const [verificationForm, toggleForm] = useState(false);
  const [discardBoxState, togglediscardBox] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [disputeComments, setDisputeComments] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"sn" | "product" | "status">("sn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [communityNameFilter, setCommunityNameFilter] = useState("__all__");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const communityNameOptions = useMemo(
    () => [...new Set(products.map((p) => p.community_name).filter(Boolean))],
    [products]
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        setError("No company selected. Please select a company first.");
        setLoading(false);
        return;
      }

      const { company_tin } = JSON.parse(selectedCompany);

      const response = await fetch("/api/factory/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_tin }),
      });

      if (response.status === 404) {
        setError("NO_PRODUCTS_FOUND");
        setIsEmpty(true);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.verifications)) {
        let sn = 1;
        const mappedProducts: Product[] = result.verifications.flatMap(
          (verification: any) =>
            (verification.products || []).map((product: any) => ({
              sn: sn++,
              id: product.id,
              product_name: product.product_name,
              hs_code: product.hs_code,
              description:
                typeof product.description === "string"
                  ? product.description
                  : "",
              state: product.state,
              community_name: product.community_names || null,
              community_short_code: product.creation_short_codes || null,
              manufacturer:
                typeof product.manufacturer === "object" &&
                product.manufacturer !== null
                  ? product.manufacturer.name
                  : "",
              verification_id: verification.id,
              verification_reference: verification.reference,
              verification_state: verification.state,
            }))
        );

        setProducts(mappedProducts);
        setIsEmpty(mappedProducts.length === 0);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch products");
        setIsEmpty(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: "sn" | "product" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedProducts = [...products]
    .filter((product) => {
      const matchesSearch =
        (product.product_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (product.hs_code || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        product.state.toLowerCase() === statusFilter.toLowerCase();
      const matchesCommunity =
        communityNameFilter === "__all__" ||
        (product.community_name || "").toLowerCase() ===
          communityNameFilter.toLowerCase();
      return (
        matchesSearch && matchesStatus && matchesCommunity
      );
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "sn":
          aValue = a.sn;
          bValue = b.sn;
          break;
        case "product":
          aValue = a.product_name.toLowerCase();
          bValue = b.product_name.toLowerCase();
          break;
        case "status":
          aValue = a.state.toLowerCase();
          bValue = b.state.toLowerCase();
          break;
        default:
          aValue = a.sn;
          bValue = b.sn;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedData = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowActionModal(true);
  };

  const handleAcceptReport = async () => {
    if (!selectedProduct) return;
    
    setIsSubmittingAction(true);
    try {
      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        alert("No company selected. Please select a company first.");
        return;
      }
      
      const { company_tin } = JSON.parse(selectedCompany);
      
      const response = await fetch("/api/factory-verification/accept-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          factory_verification_id: selectedProduct.verification_id,
          company_tin: company_tin,
        }),
      });

      const result = await response.json();
      
      if (result.status === "success") {
        setSuccessMessage("Report accepted successfully!");
        setShowActionModal(false);
        fetchProducts(); // Refresh the list
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(result.error || "Failed to accept report");
      }
    } catch (error) {
      console.error("Error accepting report:", error);
      alert("Network error occurred. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDisputeReport = async () => {
    if (!selectedProduct || !disputeComments.trim()) {
      alert("Please provide dispute comments");
      return;
    }
    
    setIsSubmittingAction(true);
    try {
      const selectedCompany = localStorage.getItem("selectedCompany");
      if (!selectedCompany) {
        alert("No company selected. Please select a company first.");
        return;
      }
      
      const { company_tin } = JSON.parse(selectedCompany);
      
      const response = await fetch("/api/factory-verification/dispute-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          factory_verification_id: selectedProduct.verification_id,
          company_tin: company_tin,
          dispute_comments: disputeComments.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.status === "success") {
        setSuccessMessage("Report disputed successfully!");
        setShowActionModal(false);
        setDisputeComments("");
        setShowDisputeForm(false);
        fetchProducts(); // Refresh the list
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(result.error || "Failed to dispute report");
      }
    } catch (error) {
      console.error("Error disputing report:", error);
      alert("Network error occurred. Please try again.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title="Factory Verification" />
      <section className="flex flex-row flex-1">
        <div className="flex flex-col items-center flex-1 min-w-0 h-[97vh] pt-18 bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-4 md:px-8 lg:px-16">
            {/* Header */}

            <div className="flex flex-row w-full justify-between items-center my-1 gap-4">
              {verificationForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Application Form
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <label className="flex justify-center items-center w-full sm:w-auto relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-[10px] pl-8 pr-2.5 py-2 text-sm placeholder:text-sm"
                    />
                    <SearchNormal1
                      size="18"
                      color="gray"
                      className="absolute left-3"
                    />
                  </label>

                  <div className="flex flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    {/* Status Filter */}
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[120px] py-2 sm:py-4.5 text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Community Name Filter */}
                    <Select
                      value={communityNameFilter}
                      onValueChange={(value) => setCommunityNameFilter(value)}
                    >
                      <SelectTrigger className="w-full sm:w-[170px] py-2 sm:py-4.5 text-sm">
                        <SelectValue placeholder="Community" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="__all__">All Communities</SelectItem>
                          {communityNameOptions.map((name) => (
                            <SelectItem key={String(name)} value={String(name)}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* button */}
              {verificationForm ? (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2"
                  onClick={() => {
                    togglediscardBox(true);
                  }}
                >
                  <CloseCircle size={17} color="red" />
                  Close
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <button
                    className="flex flex-row gap-2 sm:gap-3 justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-[6px] cursor-pointer px-3 py-2 transition-colors w-full sm:w-auto"
                    onClick={fetchProducts}
                    disabled={loading}
                  >
                    <Refresh
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${loading ? "animate-spin" : ""}`}
                      color={loading ? "#9CA3AF" : "#4B5563"}
                    />
                    <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh"}</span>
                    <span className="sm:hidden">{loading ? "..." : "↻"}</span>
                  </button>
                  <button
                    className="flex flex-row gap-2 sm:gap-3 justify-center items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-3 py-2 w-full sm:w-auto"
                    onClick={() => toggleForm(true)}
                  >
                    <Add size={18} className="sm:w-5 sm:h-5" color="white" />
                    <span className="hidden sm:inline">New Product</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              )}
            </div>
            {/* Main */}
            {verificationForm ? (
              <FactoryVerificationForm 
                onFormClose={() => toggleForm(false)}
                onRefreshList={fetchProducts}
              />
            ) : (
              <div className="w-full mt-5 rounded-md border-[0.5px] overflow-hidden overflow-y-auto h-[100%]">
                {loading ? (
                  <div className="w-full">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-5 text-left text-gray-700"></th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            S/N
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            Product
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            Trade Region
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            Creterion
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            State
                          </th>
                          <th className="px-4 py-5 text-center text-gray-700">
                            Actions
                          </th>
                          {/* <th className="px-4 py-5 text-left text-gray-700">
                            Report file
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 10 }).map((_, index) => (
                          <tr
                            key={index}
                            className="border-t-[0.5px] border-zinc-200"
                          >
                            <td className="px-4 py-4"></td>
                            <td className="px-4 py-4">
                              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                            </td>
                            {/* <td className="px-4 py-4">
                              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : error === "NO_PRODUCTS_FOUND" ? (
                  <div className="flex flex-col items-center justify-center h-64 mt-28">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Box size={32} color="#9CA3AF" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      It seems you have not registered any products for the
                      selected company. Start by adding your first product to
                      get started.
                    </p>
                    <button
                      onClick={() => toggleForm(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md transition-colors"
                    >
                      <Add size={20} color="white" />
                      Add Your First Product
                    </button>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">{error}</div>
                  </div>
                ) : isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-64 mt-28">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Box size={32} color="#9CA3AF" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      It seems you have not registered any products for the
                      selected company. Start by adding your first product to
                      get started.
                    </p>
                    <button
                      onClick={() => toggleForm(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md transition-colors"
                    >
                      <Add size={20} color="white" />
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block w-full">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            <th
                              className="px-4 py-5 text-left text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
                              onClick={() => handleSort("sn")}
                            >
                              S/N
                            </th>
                            <th className="px-4 py-5 text-left text-gray-700">
                              Product Name
                            </th>
                            <th className="px-4 py-5 text-left text-gray-700">
                              Trade Region
                            </th>
                            <th className="px-4 py-5 text-left text-gray-700">
                              Creterion
                            </th>
                            <th className="px-4 py-5 text-left text-gray-700">
                              State
                            </th>
                            <th className="px-4 py-5 text-center text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((product, index) => (
                            <tr
                              key={product.id}
                              className={`hover:bg-gray-100 transition-colors border-t-[0.5px] rounded-[12px] text-gray-700 border-zinc-200 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-white"
                              }`}
                            >
                              <td className="px-4 py-4">{product.sn}</td>
                              <td className="px-4 py-4">{product.product_name}</td>
                              <td className="px-4 py-4">
                                {product.community_name || "-"}
                              </td>
                              <td className="px-4 py-4">
                                {product.community_short_code || "-"}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                    product.verification_state
                                  )}`}
                                >
                                  {stateLabels[
                                    product.verification_state as keyof typeof stateLabels
                                  ] || product.verification_state}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleViewDetails(product)}
                                  disabled={product.verification_state !== "inspection_done"}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                    product.verification_state === "inspection_done"
                                      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                  title={
                                    product.verification_state === "inspection_done"
                                      ? "Review inspection report"
                                      : "Review not available for this status"
                                  }
                                >
                                  Review Report
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden w-full space-y-3">
                      {paginatedData.map((product, index) => (
                        <div
                          key={product.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col space-y-3">
                            {/* Header with S/N and Status */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">#{product.sn}</span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                    product.verification_state
                                  )}`}
                                >
                                  {stateLabels[
                                    product.verification_state as keyof typeof stateLabels
                                  ] || product.verification_state}
                                </span>
                              </div>
                            </div>

                            {/* Product Name */}
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm mb-1">Product Name</h3>
                              <p className="text-gray-700 text-sm break-words">{product.product_name}</p>
                            </div>

                            {/* Trade Region */}
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1">Trade Region</h4>
                              <p className="text-gray-600 text-sm">{product.community_name || "-"}</p>
                            </div>

                            {/* Criterion */}
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1">Criterion</h4>
                              <p className="text-gray-600 text-sm">{product.community_short_code || "-"}</p>
                            </div>

                            {/* Action Button */}
                            <div className="pt-2 border-t border-gray-100">
                              <button
                                onClick={() => handleViewDetails(product)}
                                disabled={product.verification_state !== "inspection_done"}
                                className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                  product.verification_state === "inspection_done"
                                    ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                title={
                                  product.verification_state === "inspection_done"
                                    ? "Review inspection report"
                                    : "Review not available for this status"
                                }
                              >
                                Review Report
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Pagination */}

            {verificationForm ? null : (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white/35 backdrop-blur-md w-full p-3 sm:p-4 gap-3 sm:gap-0">
                <span className="text-sm sm:text-base text-gray-600 order-2 sm:order-1">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex flex-row justify-between items-center gap-3 sm:gap-8 order-1 sm:order-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-6 py-1.5 text-xs sm:text-sm rounded ${
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
                    className={`px-3 sm:px-6 py-1.5 text-xs sm:text-sm rounded ${
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

        <ProgressTracker
          stats={{
            total: products.length,
            submitted: products.filter((p) => {
              // Count all states that are NOT approved/done as pending
              const approvedStates = ["approved", "report_accepted", "finalized"];
              return !approvedStates.includes(p.verification_state.toLowerCase());
            }).length,
            approved: products.filter((p) => {
              const approvedStates = ["approved", "report_accepted", "finalized"];
              return approvedStates.includes(p.verification_state.toLowerCase());
            }).length,
          }}
          onCompanyChange={fetchProducts}
        />
      </section>

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-2 hover:bg-green-600 rounded-full p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {discardBoxState && (
        <AlertBox
          title="Are you sure?"
          message="You are about to close the application and lose all the data in the form."
          onCancel={() => togglediscardBox(false)}
          onConfirm={() => {
            togglediscardBox(false);
            toggleForm(false);
          }}
          cancelText="Cancel"
          confirmText="Confirm"
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[3px] p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-4 sm:p-6 mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 pr-2">
                Factory Verification Actions
              </h2>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setDisputeComments("");
                  setShowDisputeForm(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <CloseCircle size={20} color="#6B7280" />
              </button>
            </div>

            {/* Product Info */}
            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Product Details</h3>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="break-words">
                  <span className="font-medium">Product:</span> 
                  <span className="ml-1">{selectedProduct.product_name}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">Reference:</span> 
                  <span className="ml-1">{selectedProduct.verification_reference}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">Region Details:</span> 
                  <span className="ml-1">{selectedProduct.community_name || "-"}</span>
                </div>
                <div className="break-words">
                  <span className="font-medium">Criterion:</span> 
                  <span className="ml-1">{selectedProduct.community_short_code || "-"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium">Status:</span> 
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedProduct.verification_state)}`}>
                    {stateLabels[selectedProduct.verification_state as keyof typeof stateLabels] || selectedProduct.verification_state}
                  </span>
                </div>
              </div>
            </div>

            {/* Dispute Comments Section - Only show when dispute form is active */}
            {showDisputeForm && (
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Dispute Comments (required for dispute)
                </label>
                <textarea
                  value={disputeComments}
                  onChange={(e) => setDisputeComments(e.target.value)}
                  placeholder="Enter your dispute comments here..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Action Buttons - Column Layout */}
            <div className="space-y-2 sm:space-y-3">
              {!showDisputeForm ? (
                <>
                  <button
                    onClick={handleAcceptReport}
                    disabled={isSubmittingAction}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingAction ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Accepting...</span>
                      </div>
                    ) : (
                      "Accept Report"
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    disabled={isSubmittingAction}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-md cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dispute Report
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowDisputeForm(false);
                      setDisputeComments("");
                    }}
                    disabled={isSubmittingAction}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDisputeReport}
                    disabled={isSubmittingAction || !disputeComments.trim()}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingAction ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm">Submitting...</span>
                      </div>
                    ) : (
                      "Submit Dispute"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
