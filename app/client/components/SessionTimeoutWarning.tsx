"use client";
import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  timeRemaining: string;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutWarning({
  isOpen,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
}: SessionTimeoutWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Session Timeout Warning
            </h3>
            <p className="text-sm text-gray-600">
              Your session will expire due to inactivity
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-lg font-mono font-semibold text-amber-800">
              {timeRemaining}
            </span>
            <span className="text-sm text-amber-700">remaining</span>
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            Click "Stay Logged In" to continue your session, or you'll be automatically logged out.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
