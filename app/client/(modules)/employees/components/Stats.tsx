import React from "react";

type StatsProps = {
  title: string;
  icon: React.ElementType;
  value: string;
  minimized?: boolean;
};

export default function Stat({
  title,
  icon,
  value,
  minimized = false,
}: StatsProps) {
  return (
    <div
      className={`flex flex-col w-full justify-center items-center border-[0.5px] rounded-md transition-all duration-300 ${
        title === "Total"
          ? "bg-zinc-100"
          : title === "Active"
          ? "bg-green-50 border-green-300"
          : title === "Inactive"
          ? "bg-gray-100 border-gray-200"
          : title === "Rejected"
          ? "bg-red-50 border-red-200"
          : "bg-zinc-100 border-zinc-300"
      } ${minimized ? "p-1 w-[60px] h-[60px]" : "p-3 w-full"}`}
    >
      <div className="flex flex-col items-center">
        {React.createElement(icon, {
          size: minimized ? 22 : 18,
          color:
            title === "Active"
              ? "green"
              : title === "Inactive"
              ? "gray"
              : "gray",
        })}
        {!minimized && <div className="text-sm text-gray-600">{title}</div>}
      </div>
      <div
        className={`font-semibold ${minimized ? "text-[16px]" : "text-[14px]"}`}
      >
        {value}
      </div>
    </div>
  );
}
