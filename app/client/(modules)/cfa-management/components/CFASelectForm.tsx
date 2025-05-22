"use client";
import { useState } from "react";
import { z } from "zod";
import { SearchNormal1 } from "iconsax-reactjs";

// Dummy CFA data
const CFA_LIST = [
    { id: "cfa-001", name: "CFA Dar es Salaam" },
    { id: "cfa-002", name: "CFA Arusha" },
    { id: "cfa-003", name: "CFA Mwanza" },
    { id: "cfa-004", name: "CFA Mbeya" },
    { id: "cfa-005", name: "CFA Dodoma" },
];

// Zod schema for validation
const cfaSchema = z.object({
    cfaId: z.string().min(1, "Please select a CFA"),
});

function PreviewWidget({
    open,
    onClose,
    cfa,
}: {
    open: boolean;
    onClose: () => void;
    cfa: { id: string; name: string } | null;
}) {
    return (
        <div
            className={`fixed inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[3px] transition-opacity duration-300 ${
                open
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
            }`}
            aria-modal="true"
            role="dialog"
        >
            <div className="relative w-full max-w-4xl flex flex-col bg-white rounded-xl shadow-2xl p-8 animate-fadeIn">
                {/* Close Button */}
                <div>
                    <div className="flex flex-row justify-between items-center border-b border-gray-300 pb-4 mb-4">
                        {/* Header */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-1">
                                CFA Selection Preview
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer hover:bg-red-600 flex flex-row justify-center items-center gap-2 text-sm text-red-600 font-semibold hover:text-white border-2 px-3 py-2 rounded-[8px]  border-red-600 transition-colors"
                            aria-label="Close preview"
                        >
                            Reject
                        </button>
                    </div>

                    {/* Request Info */}
                    <div className="mb-6 flex flex-col gap-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium text-gray-700">Selected CFA:</span>{" "}
                            {cfa ? cfa.name : "-"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium text-gray-700">
                                Submission Date:
                            </span>
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CFASelectForm() {
    // State for search input and selection
    const [search, setSearch] = useState("");
    const [selectedCFA, setSelectedCFA] = useState<{ id: string; name: string } | null>(null);
    const [error, setError] = useState<string | undefined>(undefined);
    const [previewState, togglePreview] = useState(false);

    // Filter CFA list based on search
    const filteredCFAs = CFA_LIST.filter((cfa) =>
        cfa.name.toLowerCase().includes(search.toLowerCase())
    );

    // Handle form submission (for preview)
    const handlePreview = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validate form data using Zod
        const result = cfaSchema.safeParse({ cfaId: selectedCFA?.id || "" });

        if (!result.success) {
            setError(result.error.errors[0]?.message);
            return;
        }

        setError(undefined);
        togglePreview(true);
    };

    // Handle search input change
    const handleInputChange = (value: string) => {
        setSearch(value);
        setError(undefined);
    };

    // Handle CFA selection
    const handleSelectCFA = (cfa: { id: string; name: string }) => {
        setSelectedCFA(cfa);
        setSearch(cfa.name);
        setError(undefined);
    };

    return (
      <div className="flex flex-col w-full h-full">
        {/* Preview Widget */}
        <PreviewWidget
          open={previewState}
          onClose={() => togglePreview(false)}
          cfa={selectedCFA}
        />
        {/* End of Preview Widget */}
        <form
          className="flex flex-col w-full pb-10 mt-5"
          onSubmit={handlePreview}
          autoComplete="off"
        >
          <div className="flex flex-col gap-4 overflow-hidden overflow-y-auto h-[400px]">
            <div className="flex flex-row gap-4 relative border-t-[0.5px] border-dashed border-gray-400 pt-8">
              {/* CFA Search Input */}
              <div className="relative w-full">
                <div className="text-sm py-2 w-full">Select CFA</div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search CFA by name..."
                    value={search}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`w-full px-6 py-3.5 pr-12 border ${
                      error ? "border-red-500" : "border-zinc-300"
                    } bg-zinc-100 outline-blue-400 rounded-[8px] placeholder:text-zinc-400 text-zinc-500 placeholder:text-[15px]`}
                    onFocus={() => setSelectedCFA(null)}
                  />
                  <SearchNormal1
                    size="22"
                    color="#9F9FA9"
                    className="absolute top-1/2 right-5 -translate-y-1/2"
                  />
                  {/* Dropdown List */}
                  {search && !selectedCFA && (
                    <ul className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-md shadow-lg z-20 max-h-[600px] overflow-y-auto">
                      {filteredCFAs.length > 0 ? (
                        filteredCFAs.map((cfa) => (
                          <li
                            key={cfa.id}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-zinc-700"
                            onClick={() => handleSelectCFA(cfa)}
                          >
                            {cfa.name}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-zinc-400">
                          No CFA found
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div className="flex flex-row justify-end mt-9">
                <button
                  type="submit"
                  className="py-3 w-[150px] h-[52px] bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 cursor-pointer"
                >
                  Submit Selection
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
}
