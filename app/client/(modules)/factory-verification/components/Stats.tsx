import React from "react";

type StatsProps = {
  title: string;
  icon: React.ElementType;
  value: string;
};

export default function Stat({ title, icon, value }: StatsProps) {
  return (
    <div
      className={`flex flex-col gap-4 justify-center items-stretch border-[0.5px] rounded-md ${
        title === "Total"
          ? "bg-zinc-100"
          : title === "Verified"
          ? "bg-green-50 border-green-300"
          : title === "Pending"
          ? "bg-orange-50 border-orange-200"
          : title === "Rejected"
          ? "bg-red-50 border-red-200"
          : "bg-zinc-100 border-zinc-300"
      }  p-3`}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm text-gray-600">{title}</div>
        <div>{React.createElement(icon, { size: 18, color: title === "Rejected Products" ? "red" : title === "Verified Products" ? "green" : title === "Pending Products" ? "orange" : title === "Total Products" ? "gray" : "gray" })}</div>
      </div>
      <div className="font-semibold text-[14]">{value}</div>
    </div>
  );
}
