"use client";
import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import MembershipForm from "./components/MembershipApplicationForm";
import { Add, CloseCircle, Lock, Refresh } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import StatsBar from "./components/StatsBar";
import MembershipApplication from "./components/MembershipApplication";

export default function Membership() {
  const [showForm, setShowForm] = useState(false);
  const [discardBoxState, setDiscardBoxState] = useState(false);
  const [selectedTin, setSelectedTin] = useState<string | null>(null);
  const [hasApplication, setHasApplication] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      const parsed = JSON.parse(storedCompany);
      setSelectedTin(parsed.company_tin || null);
    }
    const handleCompanyChange = () => {
      const updatedCompany = localStorage.getItem("selectedCompany");
      if (updatedCompany) {
        const parsed = JSON.parse(updatedCompany);
        setSelectedTin(parsed.company_tin || null);
      }
    };
    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
    window.addEventListener("storage", handleCompanyChange);
    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
      window.removeEventListener("storage", handleCompanyChange);
    };
  }, []);

  const handleDiscard = () => {
    setDiscardBoxState(false);
    setShowForm(false);
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      {discardBoxState && (
        <AlertBox
          onConfirm={handleDiscard}
          onCancel={() => setDiscardBoxState(false)}
        />
      )}
      <NavBar title={"Membership"} />
      <section className="flex flex-row w-full h-full">
        {/* Main Content */}
        <div className="flex flex-col items-start flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-start items-start my-3 w-full h-[86vh] rounded-sm relative px-4 md:px-8 lg:px-16.5">
            {/* Header */}
            <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 my-1">
              {showForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Membership Application
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Membership Management
                  </h1>
                </div>
              )}
              {/* button group */}
              <div className="flex flex-row gap-2">
                {showForm ? (
                  <button
                    className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2 w-full md:w-auto"
                    onClick={() => setDiscardBoxState(true)}
                  >
                    <CloseCircle size={20} color="red" />
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      className="flex flex-row gap-2 items-center cursor-pointer bg-gray-100 hover:bg-gray-300 text-gray-600 border border-gray-200 rounded-[6px] px-4 py-2 text-sm font-semibold mr-2"
                      onClick={() => setRefreshKey((k) => k + 1)}
                      title="Refresh Application Data"
                    >
                      <Refresh size={18} />
                      Refresh
                    </button>
                    <button
                      className={`flex flex-row gap-3 justify-between items-center text-sm rounded-[6px] px-5 py-2 w-full md:w-auto ${
                        hasApplication
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!hasApplication) setShowForm(true);
                      }}
                      disabled={hasApplication}
                      title={
                        hasApplication
                          ? "You already have a membership application"
                          : "Start a new application"
                      }
                    >
                      {hasApplication ? (
                        <Lock size={20} color="#6b7280" />
                      ) : (
                        <Add size={20} color="white" />
                      )}
                      New Application
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Main Content */}
            {showForm ? (
              <MembershipForm
                onSuccess={() => {
                  setShowForm(false);
                  setRefreshKey((k) => k + 1);
                }}
                // Always refresh MembershipApplication after any successful submit (apply or renew)
              />
            ) : (
              <div className="w-full mt-8">
                {selectedTin && (
                  <MembershipApplication
                    key={refreshKey}
                    tin={selectedTin}
                    onHasApplication={setHasApplication}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {/* Fixed Sidebar */}
        <StatsBar />
      </section>
    </main>
  );
}
