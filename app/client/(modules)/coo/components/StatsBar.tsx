import { Building, Chart, InfoCircle, Layer, Lifebuoy, Note, Verify } from "iconsax-reactjs";
import Stat from "./Stats";


export default function StatsBar() {
  return (
    <div className="w-full flex flex-col justify-between items-start h-full bg-gray-50 border-l-[1px] border-gray-200 pt-21 pb-6 px-10">
      <div className="w-full flex flex-col gap-7">
        <div className="w-full">
          <div className="font-semibold pb-3 text-gray-600 text-[14px]">
            Products Statistics
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat value="120" title={"Total"} icon={Chart} />
            <Stat value="12" title={"Pending"} icon={Layer} />
            <Stat value="96" title={"Verified"} icon={Verify} />

            {/* <Stat value="3" title={"Rejected"} icon={InfoCircle} /> */}
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-row justify-between items-center pb-2.5">
            <div className="font-semibold text-gray-600 text-[14px]">
              Company Details
            </div>
          </div>
          <div className="w-full flex flex-col items-center gap-7 justify-center border-[0.5px] rounded-xl px-5 py-5 bg-gray-100">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEtc8KBI_8Yvc-g3152PaRV1XmdPCHYGNFVQ&s"
              alt="logo"
              className="w-[150px] h-[150px] border-[0.5px] rounded-full p-4 bg-white"
            />

            <div className="w-full flex flex-col justify-center items-center">
              <div className="font-semibold text-gray-600 text-[16px]">
                AZANIA GROUP OF COMPANIES
              </div>
              <div className="font-semibold text-blue-800 text-[14px]">
                # AZG-001-A25Z
              </div>
            </div>
            <button className="text-[14px] border-1 px-3 border-zinc-300 py-3 cursor-pointer w-full rounded-[8px] hover:bg-blue-50 text-zinc-600 hover:text-blue-600 shadow-sm">
              Switch to another company
            </button>
          </div>
        </div>

        {/* kl@2024/? */}
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-row items-center gap-2">
          <Lifebuoy size="20" color="#364153" />
          <h5 className="text-gray-700 text-[16px]">Having trouble ?</h5>
        </div>
        <p className="text-gray-800 text-[15px]">
          Feel free to contact us and we will always help you through the
          process.
        </p>
        <button className="border-[1px] rounded-[9px] border-blue-600 text-blue-600 px-8 py-2 text-[15px] w-full cursor-pointer hover:bg-blue-50">
          Contact us
        </button>
      </div>
    </div>
  );
}