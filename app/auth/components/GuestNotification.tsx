"use client";

import { useEffect, useState } from "react";
import { CloseCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import {
  useGuestNotificationState,
  type ServiceKey,
} from "../services/GuestNotificationState";

const DURATION_MS = 5000;

const messageKeyMap: Record<NonNullable<ServiceKey>, string> = {
  joinMembership: "guestMessageJoin",
  reportNonTariffBarrier: "guestMessageNTB",
  businessComplaints: "guestMessageComplaints",
};

export default function GuestNotification() {
  const { isVisible, serviceKey, trigger, dismiss } = useGuestNotificationState();
  const [progress, setProgress] = useState(100);
  const tn = useTranslations("nav");

  useEffect(() => {
    if (!isVisible) return;

    setProgress(100);
    const raf = requestAnimationFrame(() => {
      setProgress(0);
    });

    const timer = setTimeout(() => {
      dismiss();
    }, DURATION_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [trigger, isVisible, dismiss]);

  if (!isVisible || !serviceKey) return null;

  const message = tn(messageKeyMap[serviceKey]);
  const hint = tn("guestLoginHint");

  return (
    <div className="w-full max-w-[620px] mx-auto mt-4 mb-2 relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50 shadow-lg">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800 leading-snug">
            {message}
          </p>
          <p className="text-xs text-amber-600 mt-1 leading-snug">{hint}</p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <CloseCircle size="20" />
        </button>
      </div>
      <div className="h-1 w-full bg-amber-200">
        <div
          className="h-full bg-amber-500"
          style={{
            width: `${progress}%`,
            transition: `width ${DURATION_MS}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
