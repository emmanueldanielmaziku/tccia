"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CloseCircle, TickCircle, Warning2, InfoCircle } from "iconsax-reactjs";
import useLogState from "../services/LogoutState";
import { logout } from "@/app/utils/auth";

type AlertBoxProps = {
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  onClose?: () => void;
  duration?: number;
  show?: boolean;
  isLogout?: boolean;
};

export default function AlertBox({
  type = "info",
  message,
  onClose,
  duration = 5000,
  show = true,
  isLogout = false,
}: AlertBoxProps) {
  const [isVisible, setIsVisible] = useState(show);
  const { toggleAlert } = useLogState();
  const t = useTranslations("alerts");

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0 && !isLogout) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose, isLogout]);

  if (!isVisible) return null;

  const handleLogout = async () => {
    toggleAlert();
    await logout();
  };

  if (isLogout) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/30 backdrop-blur-[3px] absolute transition-opacity duration-300 top-0 left-0 z-50">
        <div className="bg-gray-50 rounded-[13px] p-8 flex flex-col gap-5 w-[450px] border-[1px] border-gray-50 shadow-md">
          <div className="flex flex-row justify-start items-center gap-2">
            <InfoCircle size="23" color="red" variant="Outline" />
            <div className="text-xl font-semibold text-gray-600">
              {t("confirmLogout")}
            </div>
          </div>
          <div>{t("messages.logoutConfirm")}</div>
          <div className="flex flex-row items-center w-full gap-6">
            <button
              onClick={toggleAlert}
              className="border-[1px] border-blue-600 bg-blue-500 text-white flex-1/2 rounded-[7px] py-2.5 cursor-pointer hover:bg-blue-600 shadow-sm"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleLogout}
              className="border-[1px] border-red-600 bg-red-500 text-white flex-1/2 rounded-[7px] py-2.5 cursor-pointer hover:bg-red-700 shadow-sm"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const alertStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: <TickCircle size="20" color="#16a34a" />,
    error: <CloseCircle size="20" color="#dc2626" />,
    warning: <Warning2 size="20" color="#ca8a04" />,
    info: <InfoCircle size="20" color="#2563eb" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg border ${alertStyles[type]} shadow-lg`}
      role="alert"
    >
      <div className="flex items-center">
        {icons[type]}
        <div className="ml-3 text-sm font-normal">{message}</div>
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-gray-300"
        aria-label={t("close")}
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
      >
        <CloseCircle size="20" color="currentColor" />
      </button>
    </div>
  );
}
