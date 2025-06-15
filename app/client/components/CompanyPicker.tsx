"use client";

import { Building } from "iconsax-reactjs";
import usePickerState from "../services/PickerState";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function CompanyPicker() {
  const { togglePicker, hidePicker } = usePickerState();
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.result?.error || "Failed to fetch companies");
        }

        if (data.result?.companies) {
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
  }, []);

  const handleCompanySelect = (value: string) => {
    setSelectedCompany(value);
    const selectedCompanyData = companies.find(
      (company) => company.company_tin === value
    );
    if (selectedCompanyData) {
      localStorage.setItem(
        "selectedCompany",
        JSON.stringify(selectedCompanyData)
      );
    }
  };

  const handleContinue = () => {
    if (selectedCompany) {
      hidePicker();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[10px] absolute transition-opacity duration-300 top-0 left-0 z-50">
      <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 w-[450px] border-[1px] border-gray-50 shadow-md">
        <div className="flex flex-row justify-start items-center gap-2">
          <Building size="23" color="gray" variant="Outline" />
          <div className="text-xl font-semibold text-gray-600">
            Choose Company
          </div>
        </div>
        <div>
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
                    Loading companies...
                  </SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>
                    {error}
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
            disabled={!selectedCompany}
            className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
