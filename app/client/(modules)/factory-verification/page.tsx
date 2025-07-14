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
  draft: "Draft",
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
    case "submitted":
    case "under_review":
    case "awaiting_director":
      return "bg-orange-100 text-orange-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "inspection_scheduled":
    case "inspection_done":
    case "report_disputed":
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
  const [sortField, setSortField] = useState<"sn" | "product" | "status">("sn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hsCodeFilter, setHsCodeFilter] = useState("__all__");
  const [communityNameFilter, setCommunityNameFilter] = useState("__all__");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const hsCodeOptions = useMemo(
    () => [...new Set(products.map((p) => p.hs_code).filter(Boolean))],
    [products]
  );
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
      const matchesHSCode =
        hsCodeFilter === "__all__" ||
        (product.hs_code || "").toLowerCase() === hsCodeFilter.toLowerCase();
      const matchesCommunity =
        communityNameFilter === "__all__" ||
        (product.community_name || "").toLowerCase() ===
          communityNameFilter.toLowerCase();
      return (
        matchesSearch && matchesStatus && matchesHSCode && matchesCommunity
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
    setShowDetailModal(true);
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 ml-2 shadow-sm relative">
      <NavBar title="Factory Verification" />
      <section className="flex flex-row">
        <div className="flex flex-col items-center flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-16.5">
            {/* Header */}

            <div className="flex flex-row w-full justify-between items-center my-1">
              {verificationForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Application Form
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Search Input */}
                  <label className="flex justify-center items-center">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-[10px] pl-8 pr-2.5 py-2 text-sm placeholder:text-sm"
                    />
                    <SearchNormal1
                      size="18"
                      color="gray"
                      className="absolute left-19"
                    />
                  </label>

                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px] py-4.5">
                      <SelectValue placeholder="Select status" />
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

                  {/* HS Code Filter */}
                  <Select
                    value={hsCodeFilter}
                    onValueChange={(value) => setHsCodeFilter(value)}
                  >
                    <SelectTrigger className="w-[140px] py-4.5">
                      <SelectValue placeholder="HS Code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="__all__">All HS Codes</SelectItem>
                        {hsCodeOptions.map((code) => (
                          <SelectItem key={String(code)} value={String(code)}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Community Name Filter */}
                  <Select
                    value={communityNameFilter}
                    onValueChange={(value) => setCommunityNameFilter(value)}
                  >
                    <SelectTrigger className="w-[170px] py-4.5">
                      <SelectValue placeholder="Community Name" />
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

                  {/* Manufacturer Filter (if available) */}
                  {/* <Select
                    value={manufacturerFilter}
                    onValueChange={(value) => setManufacturerFilter(value)}
                  >
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="__all__">
                          All Manufacturers
                        </SelectItem>
                        {manufacturerOptions.map((man) => (
                          <SelectItem key={String(man)} value={String(man)}>
                            {man}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select> */}

                  {/* Sort Direction Toggle */}
                  {/* <button
                    onClick={() => {
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-zinc-300 rounded-sm hover:bg-gray-50 transition-colors"
                    title={Sort ${
                      sortDirection === "asc" ? "Descending" : "Ascending"
                    }}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </button> */}
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
                <div className="flex items-center gap-3">
                  <button
                    className="flex flex-row gap-3 justify-between items-center bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-[6px] cursor-pointer px-4 py-2 transition-colors"
                    onClick={fetchProducts}
                    disabled={loading}
                  >
                    <Refresh
                      size={18}
                      color={loading ? "#9CA3AF" : "#4B5563"}
                      className={loading ? "animate-spin" : ""}
                    />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2"
                    onClick={() => toggleForm(true)}
                  >
                    <Add size={20} color="white" />
                    Add
                  </button>
                </div>
              )}
            </div>
            {/* Main */}
            {verificationForm ? (
              <FactoryVerificationForm />
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
                            HS Code
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
                            <td className="px-4 py-4">
                              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            {/* <td className="px-4 py-4">
                              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                          HS Code
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
                          <td className="px-4 py-4">{product.hs_code}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Pagination */}

            {verificationForm ? null : (
              <div className="flex justify-between items-center mt-4 bg-white/35 backdrop-blur-md w-full">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
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

        <ProgressTracker
          stats={{
            total: products.length,
            submitted: products.filter((p) => p.state === "under_review")
              .length,
            approved: products.filter((p) => p.state === "report_accepted")
              .length,
          }}
          onCompanyChange={fetchProducts}
        />
      </section>
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
    </main>
  );
}
