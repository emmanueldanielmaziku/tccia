import { Chart, InfoCircle, Layer, Lifebuoy, TickCircle, Verify } from "iconsax-reactjs";
import Stat from "../components/Stats";


export default function StatsBar() {
  return (
    <div className="w-full flex flex-col justify-between items-start h-full bg-gray-50 border-l-[1px] border-gray-200 pt-21 pb-6 px-10">
      <div className="w-full flex flex-col gap-7">
        <div className="w-full">
          <div className="font-semibold pb-3 text-gray-600 text-[14px]">
            Products Statistics
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Stat value="120" title={"Total Companies"} icon={Chart} />
            <Stat value="96" title={"Active Companies"} icon={TickCircle} />
            <Stat value="12" title={"Inactive Companies"} icon={InfoCircle} />
          </div>
        </div>

   
        {/*  kl@2024/?  */}
      </div>

      <div className="flex flex-col gap-3.5 border-[0.5px] rounded-xl px-5 py-5 bg-gray-100 w-full">
        <div className="flex flex-row items-center gap-2">
          <Lifebuoy size="20" color="#364153" />
          <h5 className="text-gray-700 text-[16px]">Having trouble ?</h5>
        </div>
        <p className="text-gray-800 text-[15px]">
          Feel free to contact us and we will always help you through the
          process.
        </p>
        <button className="border-[1px] rounded-[7px] border-zinc-600 text-zinc-600 px-8 py-2 text-[15px] w-full cursor-pointer hover:bg-zinc-600 hover:text-white">
          Contact us
        </button>
      </div>
    </div>
  );
}