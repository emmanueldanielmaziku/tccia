import { Building } from "iconsax-reactjs";
import usePickerState from "../services/PickerState";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function CompanyPicker() {
  const { togglePicker } = usePickerState();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[10px] absolute transition-opacity duration-300 top-0 left-0 z-50">
      <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 w-[450px] border-[1px] border-gray-50 shadow-md">
        <div className="flex flex-row justify-start items-center gap-2">
          <Building size="23" color="gray" variant="Outline" />
          <div className="text-xl font-semibold text-gray-600">
            Choose Company
          </div>
        </div>
        <div>
          Please select the company you want to work with. You can change it
          later.
        </div>
        <div className="flex flex-row items-center w-full">
          {/* Company Drop Down */}
          <Select>
            <SelectTrigger className="w-full border-[1px] border-gray-300 rounded-[7px] py-6 cursor-pointer hover:bg-gray-100 shadow-sm">
              <SelectValue placeholder="Select a fruit" />
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
        <div className="flex flex-row items-center w-full gap-6 mt-2">
          {/* cancel button  */}

          <button
            onClick={togglePicker}
            className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
