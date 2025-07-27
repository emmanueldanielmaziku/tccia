"use client";

import {
  Lifebuoy,
  SidebarLeft,
  SidebarRight,
  DocumentText,
  SearchNormal,
  Warning2,
} from "iconsax-reactjs";

import { useState } from "react";

import { useTranslations } from "next-intl";

export default function StatsBar() {
  const [expanded, setExpanded] = useState(true);

  const t = useTranslations("ntb");

  return (
    <div
      className={`transition-all duration-300 h-[97vh] md:flex hidden ${
        expanded ? "flex-col" : "flex-col-reverse"
      } justify-between items-start bg-gray-50 border-l-[1px] border-gray-200 ${
        expanded
          ? "w-full lg:w-[430px] px-4 md:px-6 lg:px-10"
          : "w-[100px] px-2"
      } pt-20 pb-6 relative`}
    >
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
            {t("ntbPortal")}
          </span>
        )}
      </div>

      <div className="w-full flex flex-col gap-6">
        {/* NTB Instructions */}
        <div className="w-full">
          <div
            className={`w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl bg-gray-100/80 transition-all duration-300 ${
              expanded ? "px-5 md:px-3 py-5 md:py-3" : "px-2 py-2"
            }`}
          >
            <div
              className={`border-[0.5px] bg-blue-50 border-blue-200 py-4 rounded-full px-4 flex items-center justify-center transition-all duration-300 ${
                expanded
                  ? "w-[70px] h-[70px] md:w-[70px] md:h-[70px] p-4"
                  : "w-[40px] h-[40px] p-1"
              }`}
            >
              <Warning2 variant="Bulk" size={40} color="#138abd" />
            </div>

            {expanded && (
              <div className="w-full flex flex-col justify-center items-center text-center gap-1">
                {/* View NTB List Section */}
                <div className="w-full bg-white rounded-lg p-4 border-[0.5px] border-gray-200 mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <DocumentText size={18} color="#138abd" />
                    <h4 className="font-semibold text-gray-700 text-[13px]">
                      View NTB Reports
                    </h4>
                  </div>
                  <p className="text-gray-600 text-[10px] md:text-[13px] leading-relaxed mb-3 text-left">
                    View all your submitted NTB reports and their current status.
                  </p>
                  <div className="bg-blue-50 border-[0.5px] border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-[10px] md:text-[12px] text-left font-medium leading-relaxed">
                      Track the progress of your reported non-tariff barriers.
                    </p>
                  </div>
                </div>

                {/* Submit New NTB Section */}
                <div className="w-full bg-white rounded-lg p-4 border-[0.5px] border-gray-200">
                  <div className="flex items-center gap-1 mb-1">
                    <DocumentText size={18} color="#059669" />
                    <h4 className="font-semibold text-gray-700 text-[13px]">
                      Submit New NTB
                    </h4>
                  </div>
                  <p className="text-gray-600 text-[10px] md:text-[13px] leading-relaxed mb-3 text-left">
                    Report a new non-tariff barrier affecting your trade activities.
                  </p>
                  <div className="bg-green-50 border-[0.5px] border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-[10px] md:text-[12px] text-left font-medium leading-relaxed">
                      Provide detailed information about the barrier and its impact.
                    </p>
                  </div>
                </div>
              </div>
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
              <h5 className="text-gray-700 text-[12px] md:text-[14px] font-medium">
                {t("help.title")}
              </h5>
            )}
          </div>

          {expanded && (
            <>
              <p className="text-gray-700 text-[12px] md:text-[14px] leading-relaxed">
                {t("help.description")}
              </p>
              <button className="border-[1px] rounded-[8px] border-zinc-600 text-zinc-600 px-6 md:px-8 py-2.5 text-[12px] md:text-[14px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white transition-colors duration-200">
                {t("help.contactButton")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
