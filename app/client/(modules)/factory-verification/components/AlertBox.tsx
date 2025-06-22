import { ReactNode } from "react";
import { InfoCircle } from "iconsax-reactjs";

interface AlertBoxProps {
  title?: string;
  message?: ReactNode;
  icon?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
}

export default function AlertBox({
  title = "Are you sure ?",
  message = "You are about to close the application and lose all the data in the form.",
  icon = <InfoCircle size="23" color="red" variant="Outline" />,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  showCancel = true,
  showConfirm = true,
}: AlertBoxProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[3px] px-10 fixed top-0 left-0 z-50">
      <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 md:w-[450px] w-full border-[1px] border-gray-50 shadow-md">
        <div className="flex flex-row justify-start items-center gap-2">
          {icon}
          <div className="text-[14px] md:text-xl font-semibold text-gray-600">{title}</div>
        </div>
        <div className="text-sm md:text-[15px]">{message}</div>
        <div className="flex flex-row items-center w-full gap-6">
          {showCancel && (
            <button
              onClick={onCancel}
              className="border-[1px] text-sm border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-blue-600 shadow-sm"
            >
              {cancelText}
            </button>
          )}
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="border-[1px] text-sm border-red-600 bg-red-500 text-white flex-1/2 rounded-[7px] py-3 cursor-pointer hover:bg-red-700 shadow-sm"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}