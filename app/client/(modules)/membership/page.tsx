"use client";
import { useState } from "react";
import NavBar from "../../components/NavBar";
import MembershipForm from "./components/MembershipForm";
import { Add, CloseCircle } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";

export default function Membership() {
  const [showForm, setShowForm] = useState(false);
  const [discardBoxState, setDiscardBoxState] = useState(false);

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

      {/* Content */}
      <section className="flex flex-col lg:flex-row">
        <div className="flex flex-col items-start flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-start items-start mt-2 w-full h-[86vh] rounded-sm relative px-4 md:px-8 lg:px-16.5">
            {/* Header */}
            <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 my-1">
              {showForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  New Membership Application
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Membership Management
                  </h1>
                </div>
              )}

              {/* button */}
              {showForm ? (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => setDiscardBoxState(true)}
                >
                  <CloseCircle size={20} color="red" />
                  Close
                </button>
              ) : (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2 w-full md:w-auto"
                  onClick={() => setShowForm(true)}
                >
                  <Add size={20} color="white" />
                  New Application
                </button>
              )}
            </div>

            {/* Main Content */}
            {showForm ? (
              <MembershipForm />
            ) : (
              <div className="w-full mt-8">
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <h2 className="text-xl font-medium text-gray-700 mb-2">
                    Welcome to Membership Management
                  </h2>
                  <p className="text-gray-600">
                    Click the "New Application" button to start a new membership
                    application process.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
