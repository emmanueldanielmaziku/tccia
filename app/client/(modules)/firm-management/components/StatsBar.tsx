import { Chart, Layer, Lifebuoy, Verify } from "iconsax-reactjs";
import {
  SidebarLeft,
  SidebarRight,
} from "iconsax-reactjs";
import Stat from "../../firm-management/components/Stats";
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

export default function StatsBar() {
  const [minimized, setMinimized] = useState(false);

  return (
    <div
      className={`transition-all duration-300 h-[97vh] flex flex-col justify-between items-start bg-gray-50 border-l-[1px] border-gray-200 pt-20 pb-8 ${
        minimized ? "w-[100px] px-2" : "w-[430px] px-7"
      }`}
    >
      {/* Dashboard Title and Minimize/Expand Icon */}
      <div className="w-full flex items-center justify-between">
        {!minimized && (
          <span className="font-bold text-lg text-gray-700">Dashboard</span>
        )}
        <button
          onClick={() => setMinimized((v) => !v)}
          className="p-1 rounded hover:bg-gray-200 transition"
          aria-label={minimized ? "Expand" : "Minimize"}
        >
          {minimized ? (
              <SidebarLeft
                size="25"
                color="gray"
                variant="Outline"
                className="transition-all duration-300"
              />
            ) : (
              <SidebarRight
                size="25"
                color="#2b76f0"
                variant="Outline"
                className="transition-all duration-300"
              />
          )}
        </button>
      </div>

      <div className="w-full flex flex-col gap-7">
        {/* Firms Statistics */}
        <div className="w-full">
          {!minimized && (
            <div className="font-semibold pb-3 text-gray-600 text-[14px]">
              Firms Statistics
            </div>
          )}
          <div
            className={`grid ${
              minimized ? "grid-cols-1 gap-2" : "grid-cols-3 gap-4"
            }`}
          >
            <Stat
              value="120"
              title={"Total"}
              icon={Chart}
              minimized={minimized}
            />
            <Stat
              value="12"
              title={"Active"}
              icon={Layer}
              minimized={minimized}
            />
            <Stat
              value="96"
              title={"Inactive"}
              icon={Verify}
              minimized={minimized}
            />
          </div>
        </div>

        {/* Company Details */}
        <div className="w-full">
          {!minimized && (
            <div className="flex flex-row justify-between items-center pb-2.5">
              <div className="font-semibold text-gray-600 text-[14px]">
                Company Details
              </div>
            </div>
          )}
          <div
            className={`w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl ${
              minimized ? "px-2 py-2" : "px-5 py-5"
            } bg-gray-100`}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEtc8KBI_8Yvc-g3152PaRV1XmdPCHYGNFVQ&s"
              alt="logo"
              className={`border-[0.5px] rounded-full bg-white ${
                minimized ? "w-[40px] h-[40px] p-1" : "w-[150px] h-[150px] p-4"
              }`}
            />

            {!minimized && (
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

            {!minimized && (
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
      <div
        className={`flex flex-col gap-3.5 border-[0.5px] rounded-xl bg-gray-100 w-full ${
          minimized ? "px-2 py-2" : "px-5 py-5"
        }`}
      >
        <div className="flex flex-row items-center gap-2">
          <Lifebuoy size={minimized ? 18 : 20} color="#364153" />
          {!minimized && (
            <h5 className="text-gray-700 text-[16px]">Having trouble ?</h5>
          )}
        </div>
        {!minimized && (
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
    </div>
  );
}
