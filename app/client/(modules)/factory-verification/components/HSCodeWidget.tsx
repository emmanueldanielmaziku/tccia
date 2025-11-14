import React, { useState, useRef, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const REMOTE_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.kalen.co.tz/api/";

export default function HSCodeWidget({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [hs, setHs] = useState("");
  const [description, setDescription] = useState("");
  const [digit, setDigit] = useState("12");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Fetch HS codes (list or search)
  const fetchData = async (isSearch = false) => {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      const offset = (page - 1) * pageSize;
      if (isSearch && (hs || description || digit)) {
        const params = new URLSearchParams();
        if (hs) params.append("hs_code", hs);
        if (description) params.append("description", description);
        if (digit) params.append("digits", digit);
        params.append("limit", String(pageSize));
        params.append("offset", String(offset));
        url = `${REMOTE_BASE_URL}hscode/search?${params.toString()}`;
      } else {
        const params = new URLSearchParams();
        params.append("limit", String(pageSize));
        params.append("offset", String(offset));
        url = `${REMOTE_BASE_URL}hscode/list?${params.toString()}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Failed to fetch HS codes");
      if (json.results) {
        setData(json.results);
        setTotal(json.total_count || json.results.length);
      } else if (json.hs_codes) {
        setData(json.hs_codes);
        setTotal(json.pagination?.total || json.hs_codes.length);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch HS codes");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on open, page, or filters
  useEffect(() => {
    if (open) fetchData(Boolean(hs || description || digit !== "12"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  const handleSearch = () => {
    setPage(1);
    fetchData(true);
  };

  const handleReset = () => {
    setHs("");
    setDescription("");
    setDigit("12");
    setPage(1);
    fetchData(false);
  };

  const copyToClipboard = async (hsCode: string) => {
    try {
      await navigator.clipboard.writeText(hsCode);
      setCopiedItems(prev => new Set(prev).add(hsCode));
      toast.success(`HS Code ${hsCode} copied to clipboard!`);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(hsCode);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy HS code:', err);
      toast.error('Failed to copy HS code');
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Custom overlay for blur effect */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px] transition-opacity duration-300" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          ref={modalRef}
          className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl p-0 flex flex-col"
        >
          {/* Header */}
          <div className="border-b px-6 pt-6 pb-4 flex items-center justify-between">
            <span className="text-xl font-bold">HS Code List</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 text-lg px-2"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="px-6 pt-4 pb-2 flex flex-col gap-4">
            {/* Filter Area - Two Rows */}
            <div className="w-full bg-[#f6fafd] border rounded-md p-3">
              <div className="grid grid-cols-12 gap-2 items-center mb-2">
                <div className="col-span-2 font-medium text-sm text-[#3a4a5b]">
                  HS CODE
                </div>
                <div className="col-span-4 relative">
                  <Input
                    className="w-full pr-10 bg-[#e9f0f7] border-none focus-visible:ring-0 focus-visible:border-blue-300"
                    placeholder="0000.00.00.0000"
                    value={hs}
                    onChange={(e) => setHs(e.target.value)}
                  />
                  <Search
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3a4a5b] opacity-60"
                    size={18}
                  />
                </div>
                <div className="col-span-2 font-medium text-sm text-[#3a4a5b] text-right">
                  HS Description
                </div>
                <div className="col-span-4">
                  <Input
                    className="w-full bg-[#e9f0f7] border-none focus-visible:ring-0 focus-visible:border-blue-300"
                    placeholder=""
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-row w-full gap-4 items-center border-t py-3 mt-2">
                <div className="font-medium text-sm text-[#3a4a5b]">
                  HS CODE DIGIT
                </div>
                <div className="col-span-6 flex flex-row gap-4">
                  {["2", "4", "6", "8", "12"].map((d) => (
                    <div
                      key={d}
                      className="flex flex-row items-center gap-1 text-sm"
                    >
                      <input
                        type="radio"
                        checked={digit === d}
                        onChange={() => setDigit(d)}
                        className="accent-blue-600"
                      />
                      {d} Digits
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-4 flex flex-row gap-2 justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#2196f3] text-white cursor-pointer hover:bg-[#1976d2] px-6 h-[30px] text-[12px] rounded-sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="bg-[#2196f3] text-white cursor-pointer hover:bg-[#1976d2] px-6 h-[30px] text-[12px] rounded-sm"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
            </div>
            {/* Table */}
            <div className="w-full overflow-x-auto border rounded-md bg-white min-h-[200px]">
              {loading ? (
                <div className="py-12 text-center text-blue-600 font-semibold">
                  Loading...
                </div>
              ) : error ? (
                <div className="py-12 text-center text-red-500 font-semibold">
                  {error}
                </div>
              ) : data.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-semibold">
                  No results found.
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-48">HS Code</TableHead>
                      <TableHead>HS Description</TableHead>
                      <TableHead className="w-20">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow
                        key={row.id || row.hs_code}
                        className="hover:bg-blue-50"
                      >
                        <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                          {row.hs_code}
                        </TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => copyToClipboard(row.hs_code)}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-blue-100 rounded transition-colors duration-200 text-sm"
                            title="Copy HS Code"
                          >
                            {copiedItems.has(row.hs_code) ? (
                              <>
                                <Check size={14} className="text-green-600" />
                                <span className="text-green-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="text-blue-600" />
                                <span className="text-blue-600">Copy</span>
                              </>
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center my-5">
              <span className="text-sm text-muted-foreground">
                Page : {page} / {totalPages} &nbsp; Total : {total}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => setPage(1)}
                      aria-disabled={page === 1}
                      className="cursor-pointer"
                    >
                      {"<"}
                    </PaginationLink>
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === totalPages}
                      onClick={() => setPage(totalPages)}
                      aria-disabled={page === totalPages}
                    >
                      {">"}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Button
                type="button"
                variant="destructive"
                onClick={onClose}
                className="text-sm h-[30px] rounded-sm cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
