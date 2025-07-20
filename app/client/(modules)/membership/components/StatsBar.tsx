import {
  SidebarLeft,
  SidebarRight,
  Building,
  Lifebuoy,
  Book,
} from "iconsax-reactjs";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CompanyData {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code: string;
  company_registration_type_code: string;
  company_email: string;
  company_telephone_number: string;
}

function CategoryNotebookModal({
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
                      className="ml-4 mb-2 p-2 border rounded bg-gray-50"
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

export default function StatsBar() {
  const [expanded, setExpanded] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null
  );
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);

  useEffect(() => {
    // Load selected company from localStorage
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }

    const fetchCompanies = async () => {
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
        }
      } catch (err) {}
    };
    fetchCompanies();

    // Listen for company change events
    const handleCompanyChange = () => {
      const updatedCompany = localStorage.getItem("selectedCompany");
      if (updatedCompany) {
        setSelectedCompany(JSON.parse(updatedCompany));
      }
    };
    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
    window.addEventListener("storage", handleCompanyChange);
    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
      window.removeEventListener("storage", handleCompanyChange);
    };
  }, []);

  const handleCompanyChange = (value: string) => {
    const company = companies.find((c) => c.company_tin === value);
    if (company) {
      setSelectedCompany(company);
      localStorage.setItem("selectedCompany", JSON.stringify(company));
      window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
    }
  };

  return (
    <div
      className={`transition-all duration-300 h-[97vh] md:flex hidden bg-gray-50 border-l-[1px] border-gray-200 pt-20 pb-6 overflow-y-auto ${
        expanded
          ? "flex-col w-full lg:w-[430px] px-4 md:px-6 lg:px-10"
          : "flex-col-reverse w-[100px] px-2"
      }`}
    >
      <CategoryNotebookModal
        open={notebookOpen}
        onClose={() => setNotebookOpen(false)}
      />
      <div className="w-full flex items-center justify-start">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`p-1.5 cursor-pointer rounded-md transition-all duration-200 hover:bg-gray-100 ml-auto ${
            expanded
              ? "flex items-center justify-start"
              : "w-full flex items-center justify-center"
          }`}
          aria-label={expanded ? "Minimize" : "Expand"}
          type="button"
        >
          {expanded ? (
            <SidebarRight
              size="24"
              color="#64748b"
              variant="Outline"
              className="transition-all duration-300"
            />
          ) : (
            <SidebarLeft
              size="24"
              color="#2b76f0"
              variant="Outline"
              className="transition-all duration-300"
            />
          )}
        </button>
        {expanded && (
          <span className="w-full h-7 pl-4 ml-2 flex border-l-[0.5px] items-center font-bold text-[16px] text-gray-700">
            Company Picker
          </span>
        )}
      </div>
      <div className="w-full flex flex-col gap-8 mt-6">
        <div className="w-full">
          {/* Category Notebook Card */}
          {expanded && (
            <div className="w-full flex flex-col items-center justify-center border-[0.5px] rounded-xl bg-blue-50/60 mb-5 p-5 gap-3">
              <div className="flex items-center gap-2">
                <Book size={24} color="gray" variant="Bulk" />
                <span className="font-bold text-gray-700 text-base">
                  Category and Services List
                </span>
              </div>
              <div className="text-xs text-gray-600 text-center">
                Browse all membership categories, subcategories, and their
                services in one place.
              </div>
              <button
                className="mt-2 px-5 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm"
                onClick={() => setNotebookOpen(true)}
              >
                View Services Offered
              </button>
            </div>
          )}
  
          <div
            className={`w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl bg-gray-100/80 transition-all duration-300 ${
              expanded ? "px-5 md:px-6 py-5 md:py-6" : "px-2 py-2"
            }`}
          >
            <div
              className={`border-[0.5px] bg-blue-50 border-blue-200 py-4 rounded-full px-4 flex items-center justify-center transition-all duration-300 ${
                expanded
                  ? "w-[120px] h-[120px] md:w-[150px] md:h-[150px] p-4"
                  : "w-[40px] h-[40px] p-1"
              }`}
            >
              <Building variant="Bulk" size={70} color="#138abd" />
            </div>

            {expanded && selectedCompany && (
              <div className="w-full flex flex-col justify-center items-center text-center gap-1">
                <div className="font-semibold text-gray-700 text-[15px] md:text-[16px]">
                  {selectedCompany.company_name}
                </div>
                <div className="font-semibold text-blue-700 text-[13px] md:text-[14px]">
                  {selectedCompany.company_tin}
                </div>
                <div className="text-gray-600 text-[12px] md:text-[13px]">
                  {selectedCompany.company_nationality_code}
                </div>
              </div>
            )}

            {expanded && (
              <Select
                onValueChange={handleCompanyChange}
                value={selectedCompany?.company_tin || ""}
              >
                <SelectTrigger className="w-full border-[1px] border-blue-300 rounded-[8px] text-blue-600 py-4 md:py-5 cursor-pointer hover:bg-gray-50 shadow-sm text-sm md:text-[14px] transition-colors duration-200">
                  <SelectValue placeholder="Switch Company" className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-gray-600">
                      Companies
                    </SelectLabel>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.company_tin}
                        value={company.company_tin}
                      >
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
      {/* Help Section */}
      {expanded && (
        <div
          className={`flex flex-col gap-4 mt-2 border-[0.5px] rounded-xl bg-gray-100/80 w-full transition-all duration-300 ${
            expanded ? "px-5 md:px-6 py-5 md:py-6" : "px-2 py-2"
          }`}
        >
          <div className="flex flex-row items-center gap-2">
            <Lifebuoy size={20} color="#364153" />
            {expanded && (
              <h5 className="text-gray-700 text-[15px] md:text-[14px] font-medium">
                Contact Us
              </h5>
            )}
          </div>

          {expanded && (
            <>
              <p className="text-gray-700 text-[13px] md:text-[13px] leading-relaxed">
                Need help or have questions about membership? Our support team
                is here to assist you.
              </p>
              <button className="border-[1px] rounded-[8px] border-zinc-600 text-zinc-600 px-6 md:px-8 py-2 text-[12px] md:text-[14px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white transition-colors duration-200">
                Contact Support
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
