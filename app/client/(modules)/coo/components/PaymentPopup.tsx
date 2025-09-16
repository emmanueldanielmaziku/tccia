"use client";
import React from "react";
import { CloseCircle, Shield } from "iconsax-reactjs";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import Image from "next/image";

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: any;
}

export default function PaymentPopup({
  isOpen,
  onClose,
  certificateData,
}: PaymentPopupProps) {
  const { userProfile, loading: profileLoading } = useUserProfile();

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  // Bank details for payment
  const bankDetails = {
    bankName: "CRDB Bank PLC",
    accountName: "Tanzania Chamber of Commerce, Industry and Agriculture",
    accountNumber: "0150394367200",
    swiftCode: "CORUTZTZ",
    branch: "Corporate Branch",
    currency: "TZS"
  };


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <Shield size={16} color="#3b82f6" variant="Bold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Secure Checkout</h2>
              <p className="text-xs text-gray-500">Complete your payment</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <CloseCircle size={20} color="#9ca3af" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary & Billing Details Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">Certificate of Origin</div>
                    <div className="text-sm text-gray-600">Processing & Verification</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      TZS 20,000
                    </div>
                    <div className="text-xs text-gray-500">One-time fee</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      TZS 20,000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Details</h3>
              <div className="border border-gray-200 rounded-md p-4 h-full">
                {profileLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ) : userProfile ? (
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900">{userProfile.name}</div>
                    <div className="text-sm text-gray-600">{userProfile.email}</div>
                    <div className="text-sm text-gray-600">
                      {certificateData?.message_info?.party_name}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Failed to load billing information</div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="border border-gray-200 rounded-md p-4">
              {/* Bank Transfer Option */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                  <Image
                    src="/icons/crdb.png"
                    alt="CRDB Bank"
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Bank Transfer</div>
                  <div className="text-xs text-gray-500">{bankDetails.bankName}</div>
                </div>
                <div className="w-4 h-4 border-2 border-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Bank Details */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">
                  Transfer Details
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-xs mb-1">Account Name</span>
                    <span className="font-medium text-gray-900">TCCIA</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-xs mb-1">Account Number</span>
                    <span className="font-mono text-gray-900">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-xs mb-1">SWIFT Code</span>
                    <span className="font-mono text-gray-900">{bankDetails.swiftCode}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-xs mb-1">Reference</span>
                    <span className="font-mono text-gray-900">
                      COO-{certificateData?.message_info?.application_uuid?.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <Shield size={16} color="#059669" />
              <span className="text-xs font-medium">Your payment is secured and encrypted</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors duration-200"
            >
              Close
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Use the bank details above to complete your payment manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}