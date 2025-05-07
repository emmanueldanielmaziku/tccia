import { Lifebuoy } from "iconsax-reactjs";
import ProgressTab from "./ProgressTab";

export default function ProgressTracker() {
  return (
    <div className="w-full flex flex-col justify-between items-start h-full bg-gray-50 border-l-[1px] border-gray-200 pt-24 pb-12 px-10">
      <div className="flex flex-col w-full">
        <ProgressTab
          step={"1"}
          title={"Factory Verification"}
          status={"Working on"}
          last={false}
        />
        <ProgressTab
          step={"2"}
          title={"CoO Customer Registration"}
          status={"Required"}
          last={false}
        />
        <ProgressTab
          step={"3"}
          title={"CoO Application Submission"}
          status={"Required"}
          last={false}
        />
        <ProgressTab
          step={"4"}
          title={"CoO Application Evaluation"}
          status={"Required"}
          last={false}
        />
        <ProgressTab
          step={"5"}
          title={"CoO Issuance"}
          status={"Required"}
          last={false}
        />
        <ProgressTab
          step={"6"}
          title={"CoO Submission to Customs Office"}
          status={"Required"}
          last={true}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-row items-center gap-2">
          <Lifebuoy size="22" color="#364153" />
          <h5 className="text-gray-700 text-[16px]">Having trouble ?</h5>
        </div>
        <p className="text-gray-800 text-[16px]">
          Feel free to contact us and we will always help you through the
          process.
        </p>
        <button className="border-[2px] rounded-[8px] border-black text-black px-8 py-2 text-[16px] w-[150px] cursor-pointer hover:bg-black hover:text-white">
          Contact us
        </button>
      </div>
    </div>
  );
}
