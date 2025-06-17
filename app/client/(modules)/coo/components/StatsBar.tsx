import {
  Chart,
  Layer,
  Lifebuoy,
  Verify,
  SidebarLeft,
  SidebarRight,
  Building,
} from "iconsax-reactjs";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import Stat from "./Stats";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CompanyData {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code: string;
  company_registration_type_code: string;
  company_email: string;
  company_telephone_number: string;
}

interface ApiResponse {
  jsonrpc: string;
  id: null;
  result: {
    status: string;
    manager_id: number;
    total_companies: number;
    companies: CompanyData[];
    error?: string;
  };
}

// Custom event for company change
export const COMPANY_CHANGE_EVENT = "companyChange";

export default function StatsBar() {
  const [expanded, setExpanded] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null
  );
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("stats");

  // Function to update selected company from localStorage
  const updateSelectedCompany = () => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  };

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCompany") {
        updateSelectedCompany();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/companies/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: ApiResponse = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.push("/auth");
          return;
        }

        if (!response.ok) {
          throw new Error(data.result?.error || "Failed to fetch companies");
        }

        if (data.result?.status === "success" && data.result.companies) {
          setCompanies(data.result.companies);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch companies"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [router]);

  // Initial load of selected company
  useEffect(() => {
    updateSelectedCompany();
  }, []);

  const handleCompanySelect = (value: string) => {
    const selectedCompanyData = companies.find(
      (company) => company.company_tin === value
    );
    if (selectedCompanyData) {
      // Store only necessary company data
      const companySession = {
        id: selectedCompanyData.id,
        company_tin: selectedCompanyData.company_tin,
        company_name: selectedCompanyData.company_name,
        company_nationality_code: selectedCompanyData.company_nationality_code,
        company_registration_type_code:
          selectedCompanyData.company_registration_type_code,
        company_email: selectedCompanyData.company_email,
        company_telephone_number: selectedCompanyData.company_telephone_number,
      };
      localStorage.setItem("selectedCompany", JSON.stringify(companySession));
      setSelectedCompany(companySession);

      // Dispatch custom event to trigger page refresh
      const event = new CustomEvent(COMPANY_CHANGE_EVENT, {
        detail: { company: companySession },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      className={`transition-all duration-300 h-[97vh] flex ${
        expanded ? "flex-col" : "flex-col-reverse"
      } justify-between items-start bg-gray-50 border-l-[1px] border-gray-200 ${
        expanded
          ? "w-full lg:w-[430px] px-4 md:px-6 lg:px-10"
          : "w-[100px] px-2"
      } pt-20 pb-6 relative`}
    >
      {/* Dashboard Title and Expand/Minimize Icon */}
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
            {t("dashboard")}
          </span>
        )}
      </div>

      <div className="w-full flex flex-col gap-8">
        {/* Products Statistics */}
        <div className="w-full">
          {expanded && (
            <div className="font-semibold pb-3.5 text-gray-600 text-[14px]">
              {t("certificateStatistics")}
            </div>
          )}
          <div
            className={`grid ${
              expanded
                ? "grid-cols-1 sm:grid-cols-3 gap-4"
                : "grid-cols-1 gap-2"
            }`}
          >
            <Stat
              value="120"
              title={t("total")}
              icon={Chart}
              minimized={!expanded}
            />
            <Stat
              value="12"
              title={t("verified")}
              icon={Layer}
              minimized={!expanded}
            />
            <Stat
              value="96"
              title={t("approved")}
              icon={Verify}
              minimized={!expanded}
            />
          </div>
        </div>

        {/* Company Details */}
        <div className="w-full">
          {expanded && (
            <div className="flex flex-row justify-between items-center pb-3">
              <div className="font-semibold text-gray-600 text-[14px]">
                {t("companyDetails")}
              </div>
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
                onValueChange={handleCompanySelect}
                value={selectedCompany?.company_tin}
              >
                <SelectTrigger className="w-full border-[1px] border-blue-300 rounded-[8px] text-blue-600 py-4 md:py-5 cursor-pointer hover:bg-gray-50 shadow-sm text-sm md:text-[14px] transition-colors duration-200">
                  <SelectValue placeholder={t("switchCompany")} className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-gray-600">
                      {t("companies")}
                    </SelectLabel>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading companies...
                        </div>
                      </SelectItem>
                    ) : error ? (
                      <SelectItem value="error" disabled>
                        <div className="text-red-500">{error}</div>
                      </SelectItem>
                    ) : companies.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No companies found
                      </SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem
                          key={company.id}
                          value={company.company_tin}
                        >
                          {company.company_name}
                        </SelectItem>
                      ))
                    )}
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
          className={`flex flex-col gap-4 border-[0.5px] rounded-xl bg-gray-100/80 w-full transition-all duration-300 ${
            expanded ? "px-5 md:px-6 py-5 md:py-6" : "px-2 py-2"
          }`}
        >
          <div className="flex flex-row items-center gap-2.5">
            <Lifebuoy size={20} color="#364153" />
            {expanded && (
              <h5 className="text-gray-700 text-[15px] md:text-[16px] font-medium">
                {t("help.title")}
              </h5>
            )}
          </div>
          {expanded && (
            <>
              <p className="text-gray-700 text-[13px] md:text-[14px] leading-relaxed">
                {t("help.description")}
              </p>
              <button className="border-[1px] rounded-[8px] border-zinc-600 text-zinc-600 px-6 md:px-8 py-2.5 text-[13px] md:text-[14px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white transition-colors duration-200">
                {t("help.contactButton")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
