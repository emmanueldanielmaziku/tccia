"use client";
import { useState } from "react";
import NavBar from "../../components/NavBar";
import ProgressTracker from "../factory-verification/components/StatsBar";
import FactoryVerificationForm from "../factory-verification/components/FactoryVerificationForm";
import { Add, CloseCircle, MoreCircle, SearchNormal1 } from "iconsax-reactjs";
import AlertBox from "../factory-verification/components/AlertBox";

const productData = [
  {
    sn: 1,
    product: "GILBEYS GIN",
    eacCode: "-",
    sadcCode: "-",
    afcftaCode: "-",
    status: "Pending",
  },
  {
    sn: 2,
    product: "GORDON’S PINK & TONIC",
    eacCode: "-",
    sadcCode: "-",
    afcftaCode: "-",
    status: "Pending",
  },
  {
    sn: 3,
    product: "GORDON’S GIN & TONIC",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 4,
    product: "BOND 7-WHISKEY",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 5,
    product: "V & A -LIQUEUR",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 6,
    product: "ORIJIIN BITTERS",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SX",
    status: "Verified",
  },
  {
    sn: 7,
    product: "ORIJIN RTD",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SX",
    status: "Verified",
  },
  {
    sn: 8,
    product: "SERENGETI APPLE CIDER BEER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 9,
    product: "CHROME GIN",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SX",
    status: "Verified",
  },
  {
    sn: 10,
    product: "CHROME VODKA",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SX",
    status: "Verified",
  },
  {
    sn: 11,
    product: "BLACK LABEL WHISKEY",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 12,
    product: "RED LABEL WHISKEY",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 13,
    product: "JAMESON IRISH WHISKEY",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 14,
    product: "BAILEYS IRISH CREAM",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 15,
    product: "SMIRNOFF VODKA",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 16,
    product: "ABSOLUT VODKA",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 17,
    product: "CAPTAIN MORGAN RUM",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 18,
    product: "BACARDI RUM",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 19,
    product: "HEINEKEN BEER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 20,
    product: "GUINNESS STOUT",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 21,
    product: "TUSKER LAGER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 22,
    product: "CASTLE LAGER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Rejected",
  },
  {
    sn: 23,
    product: "AMSTEL MALT",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 24,
    product: "KILIMANJARO LAGER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 25,
    product: "SAVANNA CIDER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 26,
    product: "HUNTER'S DRY",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Rejected",
  },
  {
    sn: 27,
    product: "CORONA BEER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 28,
    product: "BUDWEISER BEER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 29,
    product: "STELLA ARTOIS",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Verified",
  },
  {
    sn: 30,
    product: "CARLSBERG BEER",
    eacCode: "MS",
    sadcCode: "SM",
    afcftaCode: "SM",
    status: "Rejected",
  },
];

export default function FactoryVerification() {
  const [verificationForm, toggleForm] = useState(false);
  const [discardBoxState, togglediscardBox] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(productData.length / itemsPerPage);
  const paginatedData = productData.slice(
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
      <NavBar title={"Factory Verification"} />

      {/* Content */}
      <section className="flex flex-row">
        <div className="flex flex-col items-center flex-1 h-[97vh] pt-18 w-full bg-transparent border-transparent border-[1px] rounded-xl">
          <div className="flex flex-col justify-between items-center mt-2 w-full h-[86vh] rounded-sm relative px-16.5">
            {/* Header */}

            <div className="flex flex-row w-full justify-between items-center my-1">
              {verificationForm ? (
                <div className="font-semibold antialiased text-[18px] text-zinc-600">
                  Application Form
                </div>
              ) : (
                <label className="flex justify-center items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
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
                  New Product
                </button>
              )}
            </div>
            {/* Main */}
            {verificationForm ? (
              <FactoryVerificationForm />
            ) : (
              <div className="w-full mt-5 rounded-md border-[0.5px] overflow-hidden overflow-y-auto h-[100%] pr-1">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-5 text-left text-gray-700"></th>
                      <th className="px-4 py-5 text-left text-gray-700">S/N</th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        Product
                      </th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        EAC OCC
                      </th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        SADC OCC
                      </th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        AfCFTA OCC
                      </th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-5 text-left text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((product, index) => (
                      <tr
                        key={product.sn}
                        className={`hover:bg-gray-100 transition-colors border-t-[0.5px] rounded-[12px] text-gray-700 border-zinc-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-white"
                        }`}
                      >
                        <td className="px-4 py-4"></td>
                        <td className="px-4 py-4">{product.sn}</td>
                        <td className="px-4 py-4">{product.product}</td>
                        <td className="px-4 py-4">{product.eacCode}</td>
                        <td className="px-4 py-4">{product.sadcCode}</td>
                        <td className="px-4 py-4">{product.afcftaCode}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-[5px] text-xs border-[0.5px] ${
                              product.status === "Verified"
                                ? "bg-green-50 text-green-500 border-green-200"
                                : product.status === "Pending"
                                ? "bg-orange-50 text-orange-400 border-orange-100"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="w-full flex items-center justify-center cursor-pointer">
                            <MoreCircle color="gray" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        <div className="w-[450px] h-[97vh]">
          <ProgressTracker />
        </div>
      </section>
      {/* End of Content */}
    </main>
  );
}
