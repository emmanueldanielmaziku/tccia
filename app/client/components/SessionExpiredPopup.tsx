"use client";
import React, { useState, useEffect } from "react";
import { CloseCircle, Clock, Shield } from "iconsax-reactjs";

interface SessionExpiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionExpiredPopup({
  isOpen,
  onClose,
}: SessionExpiredPopupProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

   
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl border border-red-200 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-200 bg-red-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield size={16} color="#dc2626" variant="Bold" />
            </div>
            <h2 className="text-base font-semibold text-red-900">Session Expired</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-md transition-colors"
          >
            <CloseCircle size={16} color="#dc2626" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-center space-y-3">
            {/* Message */}
            <div className="space-y-1">
              <p className="text-gray-600 text-sm">
                Your session has expired. Please log in again.
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center space-x-2 py-2">
              <span className="text-xs text-gray-500">Redirecting in</span>
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                <span className="text-sm font-bold text-red-600">{countdown}</span>
              </div>
              <span className="text-xs text-gray-500">seconds</span>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
            >
              Okay, Understood
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
