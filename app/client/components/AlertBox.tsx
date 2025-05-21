import { InfoCircle } from "iconsax-reactjs";
import useLogState from "../services/LogoutState";

export default function AlertBox() { 
    const { toggleAlert } = useLogState();
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[3px] absolute transition-opacity duration-300 top-0 left-0 z-50">
        <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 w-[450px] border-[1px] border-gray-50 shadow-md">
          <div className="flex flex-row justify-start items-center gap-2">
            <InfoCircle size="23" color="red" variant="Outline" />
            <div className="text-xl font-semibold text-gray-600">
              Confirm logout!
            </div>
          </div>
          <div>
            You are about to exit from the system by logging out, are you sure ?
          </div>
          <div className="flex flex-row items-center w-full gap-6">
            <button
              onClick={toggleAlert}
              className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm"
            >
              Cancel
            </button>
            <button className="border-[1px] border-red-600 bg-red-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-red-700 shadow-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
}