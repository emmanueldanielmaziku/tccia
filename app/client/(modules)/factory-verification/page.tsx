"use client";
import { useState, useEffect } from "react";
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

interface Product {
  sn: number;
  id: number;
  product: string;
  hs_code: string;
  description: string;
  eacCode: string;
  sadcCode: string;
  afcftaCode: string;
  gsp: boolean;
  india_china: boolean;
  agoa: boolean;
  international: boolean;
  state: string;
  status: string;
}

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
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

      if (result.status === "success") {
        setProducts(result.data.products);
        setError(null);
        setIsEmpty(result.empty || result.data.products.length === 0);
      } else {
        setError(result.error || "Failed to fetch products");
        setIsEmpty(false);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
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

  // Sort products based on current sort field and direction
  const sortedProducts = [...products]
    .filter((product) => {
      const matchesSearch =
        product.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.hs_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        product.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
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
          aValue = a.product.toLowerCase();
          bValue = b.product.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
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

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      {discardBoxState && (
        <AlertBox
          onConfirm={() => {
            togglediscardBox(false), toggleForm(false);
          }}
          onCancel={() => togglediscardBox(false)}
        />
      )}

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700">
                Product Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Product Name:
                    </span>
                    <p className="text-gray-800">{selectedProduct.product}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">HS Code:</span>
                    <p className="text-gray-800">{selectedProduct.hs_code}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">
                      Description:
                    </span>
                    <p className="text-gray-800">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Status
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedProduct.status === "Verified"
                        ? "bg-green-100 text-green-700"
                        : selectedProduct.status === "Pending"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedProduct.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({selectedProduct.state})
                  </span>
                </div>
              </div>

              {/* Trade Agreements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Trade Agreements
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">EAC:</span>
                    <span
                      className={
                        selectedProduct.eacCode !== "-"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.eacCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">SADC:</span>
                    <span
                      className={
                        selectedProduct.sadcCode !== "-"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.sadcCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">AfCFTA:</span>
                    <span
                      className={
                        selectedProduct.afcftaCode !== "-"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.afcftaCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Agreements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Additional Agreements
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">GSP:</span>
                    <span
                      className={
                        selectedProduct.gsp ? "text-green-600" : "text-gray-400"
                      }
                    >
                      {selectedProduct.gsp ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">
                      India-China:
                    </span>
                    <span
                      className={
                        selectedProduct.india_china
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.india_china ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">AGOA:</span>
                    <span
                      className={
                        selectedProduct.agoa
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.agoa ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">
                      International:
                    </span>
                    <span
                      className={
                        selectedProduct.international
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {selectedProduct.international ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <NavBar title={"Factory Verification"} />

      {/* Content */}
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
                      className="border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-sm pl-8 pr-2.5 py-2.5 text-sm placeholder:text-sm"
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
                    <SelectTrigger className="w-[120px] py-5">
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

                  {/* Sort Direction Toggle */}
                  <button
                    onClick={() => {
                      setSortDirection(
                        sortDirection === "asc" ? "desc" : "asc"
                      );
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-zinc-300 rounded-sm hover:bg-gray-50 transition-colors"
                    title={`Sort ${
                      sortDirection === "asc" ? "Descending" : "Ascending"
                    }`}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </button>
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
                    className="flex flex-row gap-3 justify-between items-center bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-[6px] cursor-pointer px-4 py-2.5 transition-colors"
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
                    className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2.5"
                    onClick={() => toggleForm(true)}
                  >
                    <Add size={20} color="white" />
                    New Product
                  </button>
                </div>
              )}
            </div>
            {/* Main */}
            {verificationForm ? (
              <FactoryVerificationForm />
            ) : (
              <div className="w-full mt-5 rounded-md border-[0.5px] overflow-hidden overflow-y-auto h-[100%] pr-1">
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
                            EAC OCC
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            SADC OCC
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            AfCFTA OCC
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-5 text-left text-gray-700">
                            Actions
                          </th>
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
                              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                            </td>
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
                        <th className="px-4 py-5 text-left text-gray-700"></th>
                        <th
                          className="px-4 py-5 text-left text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort("sn")}
                        >
                          <div className="flex items-center gap-1">
                            S/N
                            {sortField === "sn" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-5 text-left text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort("product")}
                        >
                          <div className="flex items-center gap-1">
                            Product
                            {sortField === "product" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-5 text-left text-gray-700">
                          EAC OCC
                        </th>
                        <th className="px-4 py-5 text-left text-gray-700">
                          SADC OCC
                        </th>
                        <th className="px-4 py-5 text-left text-gray-700">
                          AfCFTA OCC
                        </th>
                        <th
                          className="px-4 py-5 text-left text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === "status" && (
                              <span className="text-xs">
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-5 text-left text-gray-700">
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
                          <td className="px-4 py-4"></td>
                          <td className="px-4 py-4">{product.sn}</td>
                          <td className="px-4 py-4">{product.product}</td>
                          <td className="px-4 py-4">{product.eacCode}</td>
                          <td className="px-4 py-4">{product.sadcCode}</td>
                          <td className="px-4 py-4">{product.afcftaCode}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] ${
                                product.status === "Verified"
                                  ? "bg-green-50 text-green-500 border-green-200"
                                  : product.status === "Pending"
                                  ? "bg-orange-50 text-orange-400 border-orange-100"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              className="w-full flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded p-1"
                              onClick={() => handleViewDetails(product)}
                            >
                              <Eye color="gray" />
                            </button>
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
            submitted: products.filter((p) => p.status === "Pending").length,
            approved: products.filter((p) => p.status === "Verified").length,
          }}
          onCompanyChange={fetchProducts}
        />
      </section>
    </main>
  );
}
