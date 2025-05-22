import { Chart, Layer, Lifebuoy, Verify } from "iconsax-reactjs";
import Stat from "../../employees/components/Stats";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



export default function StatsBar() {
  return (
    <div className="w-full flex flex-col justify-between items-start h-full bg-gray-50 border-l-[1px] border-gray-200 pt-21 pb-6 px-10">
      <div className="w-full flex flex-col gap-7">
        <div className="w-full">
          <div className="font-semibold pb-3 text-gray-600 text-[14px]">
            Employees Statistics
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat value="120" title={"Total"} icon={Chart} />
            <Stat value="12" title={"Off-duty"} icon={Layer} />
            <Stat value="96" title={"On-duty"} icon={Verify} />
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
                AZG-001-A25Z
              </div>
              <div className=" text-gray-600 text-[12px]">
                Dar es Salaam, Tanzania
              </div>
            </div>
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