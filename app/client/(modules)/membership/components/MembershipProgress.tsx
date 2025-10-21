"use client";

import React from "react";
import { CheckCircle, Clock, AlertCircle, XCircle, FileText, CreditCard, Award, RefreshCw } from "lucide-react";

interface MembershipProgressProps {
  status: string;
  applicationNumber?: string;
  submittedDate?: string;
  paidDate?: string;
  expiryDate?: string;
}

const MembershipProgress: React.FC<MembershipProgressProps> = ({
  status,
  applicationNumber,
  submittedDate,
  paidDate,
  expiryDate,
}) => {
  // Define progress steps
  const steps = [
    {
      id: "submitted",
      title: "Application Submitted",
      description: "Your membership application has been submitted",
      icon: FileText,
      status: "completed",
    },
    {
      id: "under_review",
      title: "Under Review",
      description: "Application is being reviewed by our team",
      icon: Clock,
      status: status === "under_review" ? "current" : status === "waiting_payment" || status === "paid" || status === "expired" ? "completed" : "pending",
    },
    {
      id: "waiting_payment",
      title: "Payment Required",
      description: "Please complete your membership payment",
      icon: CreditCard,
      status: status === "waiting_payment" ? "current" : status === "paid" || status === "expired" ? "completed" : "pending",
    },
    {
      id: "paid",
      title: "Payment Confirmed",
      description: "Your membership payment has been confirmed",
      icon: CheckCircle,
      status: status === "paid" ? "current" : status === "expired" ? "completed" : "pending",
    },
    {
      id: "active",
      title: "Active Membership",
      description: "Your membership is now active",
      icon: Award,
      status: status === "paid" ? "completed" : status === "expired" ? "completed" : "pending",
    },
    {
      id: "expired",
      title: "Membership Expired",
      description: "Your membership has expired and needs renewal",
      icon: RefreshCw,
      status: status === "expired" ? "current" : "pending",
    },
  ];

  const getStepIcon = (step: typeof steps[0], stepStatus: string, stepNumber: number) => {
    const IconComponent = step.icon;
    
    if (stepStatus === "completed") {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      );
    } else if (stepStatus === "current") {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{stepNumber}</span>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 font-medium text-sm">{stepNumber}</span>
        </div>
      );
    }
  };

  const getStepColor = (stepStatus: string) => {
    if (stepStatus === "completed") return "bg-green-500";
    if (stepStatus === "current") return "bg-blue-500";
    return "bg-gray-300";
  };

  const getStepTextColor = (stepStatus: string) => {
    if (stepStatus === "completed") return "text-green-700";
    if (stepStatus === "current") return "text-blue-700";
    return "text-gray-500";
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Application Progress</h2>
            {applicationNumber && (
              <p className="text-xs text-gray-500 mt-0.5">#{applicationNumber}</p>
            )}
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            status === "paid" ? "bg-green-50 text-green-700 border border-green-200" :
            status === "waiting_payment" ? "bg-amber-50 text-amber-700 border border-amber-200" :
            status === "under_review" ? "bg-blue-50 text-blue-700 border border-blue-200" :
            status === "expired" ? "bg-red-50 text-red-700 border border-red-200" :
            "bg-gray-50 text-gray-700 border border-gray-200"
          }`}>
            {status.replace(/_/g, " ")}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100">
            <div 
              className={`h-full transition-all duration-700 ease-out ${
                status === "expired" ? "bg-red-400" :
                status === "paid" ? "bg-green-400" :
                status === "waiting_payment" ? "bg-amber-400" :
                status === "under_review" ? "bg-blue-400" :
                "bg-gray-300"
              }`}
              style={{
                width: status === "expired" ? "100%" :
                       status === "paid" ? "80%" :
                       status === "waiting_payment" ? "60%" :
                       status === "under_review" ? "40%" :
                       "20%"
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {steps.map((step, index) => {
              const stepStatus = step.status;
              const stepNumber = index + 1;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-center p-3 rounded-lg transition-all duration-200 ${
                    stepStatus === "current" ? "bg-blue-50" :
                    stepStatus === "completed" ? "bg-green-50" :
                    "bg-gray-50"
                  }`}
                >
                  <div className="mb-2">
                    {getStepIcon(step, stepStatus, stepNumber)}
                  </div>
                  <div className="w-full">
                    <h3 className={`font-medium text-xs ${getStepTextColor(stepStatus)} leading-tight`}>
                      {step.title}
                    </h3>
                    {/* Show dates for relevant steps */}
                    {step.id === "submitted" && submittedDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(submittedDate).toLocaleDateString()}
                      </p>
                    )}
                    {step.id === "paid" && paidDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(paidDate).toLocaleDateString()}
                      </p>
                    )}
                    {step.id === "expired" && expiryDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status-specific message */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
          {status === "waiting_payment" && (
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                Application approved. Complete payment to activate membership.
              </span>
            </div>
          )}
          {status === "paid" && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                Membership active. Certificate available for download.
              </span>
            </div>
          )}
          {status === "expired" && (
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                Membership expired. Renewal required.
              </span>
            </div>
          )}
          {status === "under_review" && (
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">
                Application under review. You'll be notified when processed.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipProgress;
