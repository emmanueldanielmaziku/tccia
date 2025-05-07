import { InfoCircle, TickCircle } from "iconsax-reactjs";
import { MdCheck } from "react-icons/md";

type ProgressTabProps = {
  step: string;
  title: string;
  status: string;
  last: boolean;
};

export default function ProgressTab({
  step,
  title,
  status,
  last,
}: ProgressTabProps) {
  return (
    <div className="flex flex-row gap-4 mb-9 relative">
      <div
        className={`w-[40px] max-w-[40px] h-[40px]  max-h-[40px] rounded-full border-[1px] bg-white ${
          status == "Working on"
            ? "border-black"
            : status == "Rejected"
            ? "border-red-600"
            : status == "Completed"
            ? "border-blue-500"
            : status == "Pending"
            ? "border-orange-400"
            : "border-gray-400"
        } ${
          status == "Working on" ? "text-black" : "text-gray-400"
        } flex items-center justify-center outline-8 outline-white z-10`}
      >
        {status == "Rejected" ? (
          <InfoCircle
            size="48"
            color="red"
            variant="Bold"
          
          />
        ) : status == "Pending" ? (
          <InfoCircle
            size="48"
            color="#ff8a65"
            variant="Bold"
            
          />
        ) : status == "Completed" ? (
          <TickCircle
            size="48"
            color="#2B7FFF"
            variant="Bold"
            
          />
        ) : (
          step
        )}
      </div>
      <div className="flex-1 flex flex-col items-start gap-1.5">
        <span
          className={`${
            status == "Working on"
              ? "text-black"
              : status == "Pending"
              ? "text-orange-400"
              : status == "Rejected"
              ? "text-red-500"
              : status == "Completed"
              ? "text-blue-500"
              : "text-gray-500"
          } text-sm font-semibold`}
        >
          {title}
        </span>
        <span
          className={`border-[1px] px-2 py-0.5 rounded-[4px] text-[10px] text-center ${
            status == "Working on"
              ? "text-black border-[1px] border-black"
              : status == "Rejected"
              ? "text-red-500 border-[1px] border-red-600"
              : status == "Completed"
              ? "text-blue-500 border-[1px] border-blue-500"
              : status == "Pending"
              ? "text-orange-400 border-[1px] border-orange-500"
              : "text-gray-500"
          } text-sm`}
        >
          {status}
        </span>
      </div>
      <div
        className={`h-[70px] max-h-[70px] w-[2px] max-w-[2px] left-5 top-10 rounded-md ${
          status == "Completed" ? "bg-blue-500" : "bg-gray-400"
        } ${last ? "hidden" : "absolute"}`}
      ></div>
    </div>
  );
}
