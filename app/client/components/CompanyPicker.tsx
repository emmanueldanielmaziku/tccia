"use client";

import { Building } from "iconsax-reactjs";
import usePickerState from "../services/PickerState";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import usetinFormState from "../services/companytinformState";
import { Loader2 } from "lucide-react";

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
  const [open, setOpen] = useState(false);

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
      window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
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
        window.dispatchEvent(new Event("COMPANY_CHANGE_EVENT"));
        hidePicker();
      }
    }
  };

  const handleAddCompany = () => {
    toggleCompanyTinForm(); // Only show TIN input when Register is clicked
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full border-[1px] border-gray-300 rounded-[7px] py-6 cursor-pointer hover:bg-gray-100 shadow-sm justify-between",
                  !selectedCompany && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                {selectedCompany
                  ? companies.find((c) => c.company_tin === selectedCompany)
                      ?.company_name
                  : "Select a company"}
                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[385px] max-w-[90vw] p-0">
              <Command>
                <CommandInput placeholder="Search company..." className="h-9" />
                <CommandList>
                  {isLoading ? (
                    <CommandEmpty>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading companies...
                      </div>
                    </CommandEmpty>
                  ) : error ? (
                    <CommandEmpty>
                      <div className="text-red-500">{error}</div>
                    </CommandEmpty>
                  ) : companies.length === 0 ? (
                    <CommandEmpty>No companies found</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Companies">
                      {companies.map((company) => (
                        <CommandItem
                          key={company.id}
                          value={company.company_tin}
                          onSelect={(currentValue) => {
                            handleCompanySelect(currentValue);
                            setOpen(false);
                          }}
                        >
                          {company.company_name}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedCompany === company.company_tin
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
