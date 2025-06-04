import {
  Chart,
  Layer,
  Lifebuoy,
  Verify,
  SidebarLeft,
  SidebarRight,
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
import { useState } from "react";
import Stat from "./Stats";
import { useTranslations } from "next-intl";

export default function StatsBar() {
  const [expanded, setExpanded] = useState(true);
  const t = useTranslations("stats");

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
          className={`p-1 cursor-pointer rounded transition ml-auto ${
            expanded
              ? "flex items-center justify-start"
              : "w-full flex items-center justify-center"
          }`}
          aria-label={expanded ? "Minimize" : "Expand"}
          type="button"
        >
          {expanded ? (
            <SidebarRight
              size="26"
              color="gray"
              variant="Outline"
              className="transition-all duration-300"
            />
          ) : (
            <SidebarLeft
              size="26"
              color="#2b76f0"
              variant="Outline"
              className="transition-all duration-300"
            />
          )}
        </button>
        {expanded && (
          <span className="w-full h-7 pl-4 ml-2 flex border-l-[0.5px] items-center font-bold text-lg text-gray-700">
            {t("dashboard")}
          </span>
        )}
      </div>

      <div className="w-full flex flex-col gap-7">
        {/* Products Statistics */}
        <div className="w-full">
          {expanded && (
            <div className="font-semibold pb-3 text-gray-600 text-[14px]">
              {t("firmStatistics")}
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
              title={t("pending")}
              icon={Layer}
              minimized={!expanded}
            />
            <Stat
              value="96"
              title={t("verified")}
              icon={Verify}
              minimized={!expanded}
            />
          </div>
        </div>

        {/* Company Details */}
        <div className="w-full">
          {expanded && (
            <div className="flex flex-row justify-between items-center pb-2.5">
              <div className="font-semibold text-gray-600 text-[14px]">
                {t("companyDetails")}
              </div>
            </div>
          )}
          <div
            className={`w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl bg-gray-100 transition-all duration-300 ${
              expanded ? "px-4 md:px-5 py-4 md:py-5" : "px-2 py-2"
            }`}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEtc8KBI_8Yvc-g3152PaRV1XmdPCHYGNFVQ&s"
              alt="logo"
              className={`border-[0.5px] rounded-full bg-white transition-all duration-300 ${
                expanded
                  ? "w-[120px] h-[120px] md:w-[150px] md:h-[150px] p-4"
                  : "w-[40px] h-[40px] p-1"
              }`}
            />

            {expanded && (
              <div className="w-full flex flex-col justify-center items-center text-center">
                <div className="font-semibold text-gray-600 text-[14px] md:text-[16px]">
                  AZANIA GROUP OF COMPANIES
                </div>
                <div className="font-semibold text-blue-800 text-[12px] md:text-[14px]">
                  AZG-001-A25Z
                </div>
                <div className="text-gray-600 text-[11px] md:text-[12px]">
                  Dar es Salaam, Tanzania
                </div>
              </div>
            )}
            {expanded && (
              <Select>
                <SelectTrigger className="w-full border-[1px] border-blue-300 rounded-[7px] text-blue-500 py-4 md:py-6 cursor-pointer hover:bg-gray-100 shadow-sm text-sm md:text-base">
                  <SelectValue placeholder={t("switchCompany")} className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("companies")}</SelectLabel>
                    <SelectItem value="apple">TCCIA COMPANY</SelectItem>
                    <SelectItem value="banana">ABC COMPANY</SelectItem>
                    <SelectItem value="blueberry">AZANIA GROUP</SelectItem>
                    <SelectItem value="grapes">MO COMPANY</SelectItem>
                    <SelectItem value="pineapple">SERENGETI COMPANY</SelectItem>
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
          className={`flex flex-col gap-3.5 border-[0.5px] rounded-xl bg-gray-100 w-full transition-all duration-300 ${
            expanded ? "px-4 md:px-5 py-4 md:py-5" : "px-2 py-2"
          }`}
        >
          <div className="flex flex-row items-center gap-2">
            <Lifebuoy size={expanded ? 20 : 18} color="#364153" />
            {expanded && (
              <h5 className="text-gray-700 text-[14px] md:text-[16px]">
                {t("help.title")}
              </h5>
            )}
          </div>
          {expanded && (
            <>
              <p className="text-gray-800 text-[13px] md:text-[15px]">
                {t("help.description")}
              </p>
              <button className="border-[1px] rounded-[7px] border-zinc-600 text-zinc-600 px-6 md:px-8 py-2 text-[13px] md:text-[15px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white">
                {t("help.contactButton")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
