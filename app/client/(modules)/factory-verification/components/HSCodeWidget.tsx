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
import { Search } from "lucide-react";

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
  const modalRef = useRef<HTMLDivElement>(null);

  // Dummy data for demonstration
  const data = [
    { code: "010121000000", desc: "Horses: Pure-bred breeding animals" },
    { code: "010129000000", desc: "Horses: Other pure bred-breeding animals" },
    { code: "010130100000", desc: "Asses: Pure-bred breeding animals" },
    { code: "010130900000", desc: "Asses: Other" },
    {
      code: "010190100000",
      desc: "Live horses, asses, mules and hinnies: Pure-bred breeding animals",
    },
    {
      code: "010190900000",
      desc: "Live horses, asses, mules and hinnies: Other",
    },
    { code: "010221000000", desc: "Cattle: Pure-bred breeding animals" },
    { code: "010229000000", desc: "Cattle: Other" },
    { code: "010231000000", desc: "Buffalo: Pure-bred breeding animals" },
    { code: "010239000000", desc: "Buffalo: Other" },
    { code: "010290100000", desc: "Camels: Pure-bred breeding animals" },
    { code: "010290900000", desc: "Camels: Other" },
    { code: "010310000000", desc: "Swine: Pure-bred breeding animals" },
    { code: "010391000000", desc: "Swine: Other, weighing less than 50 kg" },
    { code: "010392000000", desc: "Swine: Other, weighing 50 kg or more" },
    { code: "010410100000", desc: "Sheep: Pure-bred breeding animals" },
    { code: "010410900000", desc: "Sheep: Other" },
    { code: "010420100000", desc: "Goats: Pure-bred breeding animals" },
    { code: "010420900000", desc: "Goats: Other" },
    {
      code: "010511000000",
      desc: "Fowls of the species Gallus domesticus: Weighing not more than 185 g",
    },
    {
      code: "010512000000",
      desc: "Fowls of the species Gallus domesticus: Weighing more than 185 g",
    },
  ];
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

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
                    <div key={d} className="flex flex-row items-center gap-1 text-sm">
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
                  className="bg-[#2196f3] text-white hover:bg-[#1976d2] px-6 h-[30px] text-[12px] rounded-sm"
                  onClick={() => {
                    setHs("");
                    setDescription("");
                    setDigit("12");
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  className="bg-[#2196f3] text-white hover:bg-[#1976d2] px-6 h-[30px] text-[12px] rounded-sm"
                >
                  Search
                </Button>
              </div>
            </div>
            {/* Table */}
            <div className="w-full overflow-x-auto border rounded-md bg-white">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-48">HS Code</TableHead>
                    <TableHead>HS Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, idx) => (
                    <TableRow key={row.code} className="hover:bg-blue-50">
                      <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="text-blue-600 underline cursor-pointer">
                        {row.code}
                      </TableCell>
                      <TableCell>{row.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center my-5">
              <span className="text-sm text-muted-foreground">
                Page : {page} / {totalPages} &nbsp; Total : {data.length}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => setPage(1)}
                      aria-disabled={page === 1}
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
                      isActive={page === totalPages}
                      onClick={() => setPage(totalPages)}
                      aria-disabled={page === totalPages}
                    >
                      {">"}
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <Button type="button" variant="destructive" onClick={onClose} className="text-sm h-[30px] rounded-sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
