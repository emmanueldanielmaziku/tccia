import React from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("stats");

  return (
    <div
      className={`flex flex-col w-full justify-center items-center border-[0.5px] rounded-md transition-all duration-300 ${
        title === t("total")
          ? "bg-zinc-100"
          : title === t("approved")
          ? "bg-green-50 border-green-300"
          : title === t("pending")
          ? "bg-orange-50 border-orange-200"
          : title === t("rejected")
          ? "bg-red-50 border-red-200"
          : "bg-zinc-100 border-zinc-300"
      } ${minimized ? "p-1 w-[60px] h-[60px]" : "p-2 md:p-3 w-full"}`}
    >
      <div className="flex flex-col items-center">
        {React.createElement(icon, {
          size: minimized ? 22 : 18,
          color:
            title === t("rejected")
              ? "red"
              : title === t("verified")
              ? "green"
              : title === t("pending")
              ? "orange"
              : title === t("total")
              ? "gray"
              : "gray",
        })}
        {!minimized && (
          <div className="text-xs md:text-sm text-gray-600">{title}</div>
        )}
      </div>
      <div
        className={`font-semibold ${
          minimized ? "text-[16px]" : "text-[13px] md:text-[14px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
