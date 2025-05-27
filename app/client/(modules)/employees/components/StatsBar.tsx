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

export default function StatsBar() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={`transition-all duration-300 h-[97vh] flex ${
        expanded ? "flex-col" : "flex-col-reverse"
      } justify-between items-start bg-gray-50 border-l-[1px] border-gray-200 ${
        expanded ? "w-[430px] px-10" : "w-[100px] px-2"
      } pt-20 pb-6 relative`}
    >
      {/* Dashboard Title and Expand/Minimize Icon */}
      <div className="w-full flex items-center justify-start mb-4">
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
              size="30"
              color="gray"
              variant="Outline"
              className="transition-all duration-300"
            />
          ) : (
            <SidebarLeft
              size="30"
              color="#2b76f0"
              variant="Outline"
              className="transition-all duration-300"
            />
          )}
        </button>
        {expanded && (
          <span className="w-full h-7 pl-4 ml-2 flex border-l-[0.5px] items-center font-bold text-lg text-gray-700">Dashboard</span>
        )}
      </div>

      <div className="w-full flex flex-col gap-7">
        {/* Products Statistics */}
        <div className="w-full">
          {expanded && (
            <div className="font-semibold pb-3 text-gray-600 text-[14px]">
              Employees Statistics
            </div>
          )}
          <div
            className={`grid ${
              expanded ? "grid-cols-3 gap-4" : "grid-cols-1 gap-2"
            }`}
          >
            <Stat
              value="120"
              title={"Total"}
              icon={Chart}
              minimized={!expanded}
            />
            <Stat
              value="12"
              title={"Pending"}
              icon={Layer}
              minimized={!expanded}
            />
            <Stat
              value="96"
              title={"Verified"}
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
                Company Details
              </div>
            </div>
          )}
          <div
            className={`w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl bg-gray-100 transition-all duration-300 ${
              expanded ? "px-5 py-5" : "px-2 py-2"
            }`}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEtc8KBI_8Yvc-g3152PaRV1XmdPCHYGNFVQ&s"
              alt="logo"
              className={`border-[0.5px] rounded-full bg-white transition-all duration-300 ${
                expanded ? "w-[150px] h-[150px] p-4" : "w-[40px] h-[40px] p-1"
              }`}
            />

            {expanded && (
              <div className="w-full flex flex-col justify-center items-center">
                <div className="font-semibold text-gray-600 text-[16px]">
                  AZANIA GROUP OF COMPANIES
                </div>
                <div className="font-semibold text-blue-800 text-[14px]">
                  AZG-001-A25Z
                </div>
                <div className=" text-gray-600 text-[12px]">
                  Dar es Salaam, Tanzania
                </div>
              </div>
            )}
            {expanded && (
              <Select>
                <SelectTrigger className="w-full border-[1px] border-blue-300 rounded-[7px] text-blue-500 py-6 cursor-pointer hover:bg-gray-100 shadow-sm">
                  <SelectValue
                    placeholder="Switch to another company"
                    className=""
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Companies</SelectLabel>
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
            expanded ? "px-5 py-5" : "px-2 py-2"
          }`}
        >
          <div className="flex flex-row items-center gap-2">
            <Lifebuoy size={expanded ? 20 : 18} color="#364153" />
            {expanded && (
              <h5 className="text-gray-700 text-[16px]">Having trouble ?</h5>
            )}
          </div>
          {expanded && (
            <>
              <p className="text-gray-800 text-[15px]">
                Feel free to contact us and we will always help you through the
                process.
              </p>
              <button className="border-[1px] rounded-[7px] border-zinc-600 text-zinc-600 px-8 py-2 text-[15px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white">
                Contact us
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
