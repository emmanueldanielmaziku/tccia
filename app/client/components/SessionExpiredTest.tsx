"use client";
import React from "react";
import { useSessionExpired } from "../../services/SessionExpiredService";
import { Button } from "@/components/ui/button";

export default function SessionExpiredTest() {
  const { showSessionExpired } = useSessionExpired();

  const simulateSessionExpired = () => {
    showSessionExpired();
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Session Expired Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button below to simulate a session expired scenario and see the popup in action.
      </p>
      <Button 
        onClick={simulateSessionExpired}
        variant="destructive"
        className="w-full"
      >
        Simulate Session Expired
      </Button>
    </div>
  );
}
