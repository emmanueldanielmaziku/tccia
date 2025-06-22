"use client";

import { Building } from "iconsax-reactjs";
import usePickerState from "../services/PickerState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import usetinFormState from "../services/companytinformState";

interface Company {
  id: number;
  company_tin: string;
  company_name: string;
  company_nationality_code: string;
  company_registration_type_code: string;
  company_fax_number: string;
  company_postal_base_address: string;
  company_postal_detail_address: string;
  company_physical_address: string;
  company_email: string;
  company_postal_code: string;
  company_telephone_number: string;
  company_description: string;
  state: string;
}

interface ApiResponse {
  status: string;
  data?: {
    manager_id: number;
    total_companies: number;
    companies: Company[];
    pagination?: any;
  };
  error?: {
    code: string;
    message: string;
    error_details?: string;
  };
  message?: string;
}

export default function CompanyPicker() {
  const router = useRouter();
  const { togglePicker, hidePicker } = usePickerState();
  const { tinformState, toggleCompanyTinForm } = usetinFormState();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          throw new Error(
            data.error?.message || data.message || "Failed to fetch companies"
          );
        }

        if (data.status === "success" && data.data?.companies) {
          setCompanies(data.data.companies);

          const storedCompany = localStorage.getItem("selectedCompany");
          if (storedCompany) {
            const parsedCompany = JSON.parse(storedCompany);
            if (
              data.data.companies.some(
                (c) => c.company_tin === parsedCompany.company_tin
              )
            ) {
              setSelectedCompany(parsedCompany.company_tin);
            }
          }
        } else {
          setCompanies([]);
          setError(data.error?.message || data.message || "No companies found");
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

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "selectedCompany") {
        const storedCompany = localStorage.getItem("selectedCompany");
        if (storedCompany) {
          setSelectedCompany(JSON.parse(storedCompany));
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleCompanySelect = (value: string) => {
    setSelectedCompany(value);
    const selectedCompanyData = companies.find(
      (company) => company.company_tin === value
    );
    if (selectedCompanyData) {
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
    }
  };

  const handleContinue = () => {
    if (selectedCompany) {
      const selectedCompanyData = companies.find(
        (company) => company.company_tin === selectedCompany
      );

      if (selectedCompanyData) {
        const companySession = {
          id: selectedCompanyData.id,
          company_tin: selectedCompanyData.company_tin,
          company_name: selectedCompanyData.company_name,
          company_nationality_code:
            selectedCompanyData.company_nationality_code,
          company_registration_type_code:
            selectedCompanyData.company_registration_type_code,
          company_email: selectedCompanyData.company_email,
          company_telephone_number:
            selectedCompanyData.company_telephone_number,
        };
        localStorage.setItem("selectedCompany", JSON.stringify(companySession));

        hidePicker();
      }
    }
  };

  const handleAddCompany = () => {
    toggleCompanyTinForm();
    router.push("/client/firm-management");
    hidePicker();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[10px] absolute transition-opacity duration-300 top-0 left-0 z-50">
      <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 w-[450px] max-w-[90vw] border-[1px] border-gray-50 shadow-md">
        <div className="flex flex-row justify-start items-center gap-2">
          <Building size="23" color="gray" variant="Outline" />
          <div className="text-xl font-semibold text-gray-600">
            Choose Company
          </div>
        </div>
        <div className="text-gray-600">
          Please select the company you want to work with. You can change it
          later.
        </div>
        <div className="flex flex-row items-center w-full">
          <Select onValueChange={handleCompanySelect} value={selectedCompany}>
            <SelectTrigger className="w-full border-[1px] border-gray-300 rounded-[7px] py-6 cursor-pointer hover:bg-gray-100 shadow-sm">
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Companies</SelectLabel>
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
                    <SelectItem key={company.id} value={company.company_tin}>
                      {company.company_name}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center w-full gap-6 mt-2">
          <button
            onClick={handleContinue}
            disabled={!selectedCompany || isLoading}
            className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              "Continue"
            )}
          </button>
          {!selectedCompany && (
            <button
              onClick={handleAddCompany}
              disabled={isLoading}
              className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
