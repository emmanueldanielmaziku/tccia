"use client";
import { useState } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../firm-management/components/StatsBar";
import {
  Add,
  ArchiveBook,
  Box,
  CloseCircle,
  SearchNormal1,
} from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";
import FirmRegForm from "./components/FirmRegForm";
import usetinState from "../../services/TinState";

const firmData = [
  {
    sn: 1,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEtc8KBI_8Yvc-g3152PaRV1XmdPCHYGNFVQ&s",
    firm: "GILBEYS GIN LTD",
    id: "AZG-123456",
    address: "Dar es Salaam, Tanzania",
    products: 120,
    certificates: 45,
    status: "Active",
  },

  {
    sn: 2,
    logo: "https://www.nidadanish.com/images/feature_variant/121/MO-1.webp",
    firm: "GORDON’S PINK & TONIC CO.",
    id: "AZG-123457",
    address: "Nairobi, Kenya",
    products: 100,
    certificates: 30,
    status: "Active",
  },

  {
    sn: 3,
    logo: "https://beertasting.app/storage/media/c5600dded68eaa62da943a1384c27c24/ncpu5h7wxru4skr32h9e.jpg",
    firm: "BOMBAY SAPPHIRE",
    id: "AZG-123458",
    address: "Kampala, Uganda",
    products: 150,
    certificates: 60,
    status: "Inactive",
  },

  {
    sn: 4,
    logo: "https://www.ligikuu.co.tz/wp-content/uploads/2020/12/KAGERA.png",
    firm: "GILBEYS GIN LTD",
    id: "AZG-123456",
    address: "Dar es Salaam, Tanzania",
    products: 120,
    certificates: 45,
    status: "Active",
  },
];

export default function FirmManagement() {
  const [verificationForm, toggleForm] = useState(false);
  const [discardBoxState, togglediscardBox] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const { tinState, toggleCompanyTin } = usetinState();
  const itemsPerPage = 20;

  const totalPages = Math.ceil(firmData.length / itemsPerPage);
  const paginatedData = firmData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <main className="w-full h-[97vh] rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      {discardBoxState && (
        <AlertBox
          onConfirm={() => {
            togglediscardBox(false), toggleForm(false);
          }}
          onCancel={() => togglediscardBox(false)}
        />
      )}
      <NavBar title={"Firm Management"} />

      {/* Content */}
      <section className="flex flex-row">
        <div className="flex flex-col items-center flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-16.5">
            {/* Header */}
            <div className="flex flex-row w-full justify-between items-center my-1">
              {verificationForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Add New Firm
                </div>
              ) : (
                <label className="flex justify-center items-center">
                  <input
                    type="text"
                    placeholder="Search firms..."
                    className="border-[0.5px] border-zinc-300 focus:outline-2 focus:outline-blue-400 rounded-sm pl-8 pr-2.5 py-2.5 text-sm placeholder:text-sm"
                  />
                  <SearchNormal1
                    size="18"
                    color="gray"
                    className="absolute left-19"
                  />
                </label>
              )}

              {/* button */}
              {verificationForm ? (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-transparent hover:bg-red-100 text-red-500 text-sm rounded-[6px] border-[1px] border-red-500 cursor-pointer px-5 py-2.5"
                  onClick={() => {
                    togglediscardBox(true);
                  }}
                >
                  <CloseCircle size={20} color="red" />
                  Close
                </button>
              ) : (
                <button
                  className="flex flex-row gap-3 justify-between items-center bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-[6px] cursor-pointer px-5 py-2.5"
                  onClick={() => toggleForm(true)}
                >
                  <Add size={20} color="white" />
                  New Firm
                </button>
              )}
            </div>
            {/* Main */}
            {/* {tinState && <CompanyTinInput />} */}
            {verificationForm ? (
              <FirmRegForm />
            ) : (
              <div className="w-full grid grid-cols-1 pr-3 gap-5 mt-5 rounded-md overflow-hidden overflow-y-auto">
                {paginatedData.map((firm, index) => (
                  <div
                    key={firm.sn}
                    className={`hover:bg-white bg-gray-100 flex flex-col transition-colors border-[0.5px] rounded-[7px] text-gray-700 border-zinc-300 shadow-sm`}
                  >
                    <div className="flex flex-row justify-between items-center border-b-[0.5] border-zinc-200 p-5">
                      <div className="font-semibold">{`${firm.sn}. ${firm.firm}`}</div>
                      <div
                        className={`border-[0.5px] text-sm rounded-[30px] px-3 py-1 ${
                          firm.status == "Active"
                            ? "bg-green-100 border-green-300 text-green-600"
                            : "bg-red-100 border-red-300 text-red-600"
                        }  `}
                      >
                        {firm.status}
                      </div>
                    </div>
                    {/* header */}
                    <div className="flex flex-row items-center p-5 gap-3 bg-gray-50">
                      <img
                        src={firm.logo}
                        alt="Logo"
                        className="w-18 h-18 object-cover rounded-md bg-white p-1 border-[0.5px] border-zinc-200"
                      />

                      <div className="w-full flex flex-col gap-1 justify-start">
                        <div className="font-semibold">{firm.firm}</div>
                        <div className="text-sm">{firm.address}</div>
                        <div className="text-blue-600 text-sm">{firm.id}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col gap-3 px-5 pb-5 bg-gray-50 rounded-b-md">
                        <div className="flex flex-row w-full justify-between items-center">
                          <div className="flex flex-row justify-start items-center gap-1">
                            <Box size={18} color="#36568a" />
                            <span className="text-[15px]">Total Products</span>
                          </div>
                          <div className="flex-1 mx-4 border-t-1 border-dashed border-zinc-400 h-0" />
                          <div>{firm.products}</div>
                        </div>
                        <div className="flex flex-row w-full justify-between items-center">
                          <div className="flex flex-row justify-start items-center gap-1">
                            <ArchiveBook size={18} color="#36568a" />
                            <span className="text-[15px]">
                              Total Certificates of Origin
                            </span>
                          </div>
                          <div className="flex-1 mx-4 border-t-1 border-dashed border-zinc-400 h-0" />
                          <div>{firm.certificates}</div>
                        </div>
                      </div>
                    </div>
                    {/* end of header */}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {verificationForm ? null : (
              <div className="flex justify-between items-center mt-4 bg-white/35 backdrop-blur-md w-full">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex flex-row justify-between items-center gap-8">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-6 py-1.5 text-sm rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-6 py-1.5 text-sm rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
          <ProgressTracker />

      </section>
      {/* End of Content */}
    </main>
  );
}
