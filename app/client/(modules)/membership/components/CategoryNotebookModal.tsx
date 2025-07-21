import { useState, useEffect } from "react";
import { Book } from "iconsax-reactjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CategoryNotebookModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch("/api/membership/categories")
      .then((res) => res.json())
      .then((data) => {
        const cats = data?.data?.categories || [];
        setCategories(cats);
        setTabValue(cats.length > 0 ? cats[0].name : "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch categories.");
        setLoading(false);
      });
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[3px]">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Book size={28} color="#2b76f0" variant="Bulk" />
          <h2 className="text-xl font-bold text-gray-800">
            Category and Services Notebook
          </h2>
        </div>
        <p className="mb-4 text-gray-600">
          Browse all membership categories, subcategories, and their services.
        </p>
        {loading ? (
          <div className="text-center py-8 text-blue-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList className="mb-4 w-full flex flex-wrap gap-2">
              {categories.map((cat: any) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.name}
                  className="capitalize"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat: any) => (
              <TabsContent key={cat.id} value={cat.name}>
                <div className="max-h-[50vh] overflow-y-auto space-y-6">
                  <div className="font-bold text-blue-800 text-lg mb-1">
                    {cat.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {cat.description}
                  </div>
                  {cat.subcategories?.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="mr-3 mb-2 p-2 border rounded bg-gray-50"
                    >
                      <div className="font-semibold text-blue-700 text-sm">
                        {sub.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {sub.description}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Annual Fee: {sub.annual_fee} | Certificate Fee:{" "}
                        {sub.certificate_fee} | Total Fees: {sub.total_fees}
                      </div>
                      <div className="mt-1">
                        <div className="font-medium text-xs">Services:</div>
                        <ul className="list-disc ml-6">
                          {sub.services?.map((srv: any) => (
                            <li key={srv.id} className="text-xs text-gray-700">
                              <span className="font-semibold">{srv.name}</span>{" "}
                              -{" "}
                              <span className="text-gray-500">
                                {srv.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
