"use client";

import { Book, Building } from "iconsax-reactjs";
import { Coins, Globe, Smartphone } from "lucide-react";

export default function PaymentGuidelineModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[3px]">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative flex flex-col max-h-[85vh]">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Book size={28} color="#2b76f0" variant="Bulk" />
          <h2 className="text-xl font-bold text-gray-800">
            Payment Guidelines
          </h2>
        </div>

        <p className="mb-4 text-xs sm:text-sm text-gray-600">
          Step-by-step payment instructions for multiple channels
        </p>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          
          {/* CRDB Internet Banking & SimBanking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Globe size={16} />
                CRDB INTERNET BANKING
              </div>
              <ol className="list-decimal ml-5 text-xs text-gray-700 space-y-1">
                <li>Select Payment &rarr; Bill Payment</li>
                <li>For Company Category, select Others</li>
                <li>For Company Name, select <span className="font-semibold text-blue-600">TNCC</span></li>
                <li>Enter Reference Number</li>
              </ol>
            </div>

            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Smartphone size={16} />
                SIMBANKING
              </div>
              <ol className="list-decimal ml-5 text-xs text-gray-700 space-y-1">
                <li>Login and swipe for more services</li>
                <li>Select More Payments &rarr; Choose <span className="font-semibold text-blue-600">TNCC</span></li>
                <li>Enter Reference Number</li>
                <li>Verify details, enter Amount and submit</li>
              </ol>
            </div>
          </div>

          {/* CRDB Wakala & Branch Teller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Coins size={16} />
                CRDB WAKALA / AGENTS
              </div>
              <div className="space-y-2 text-xs text-gray-700">
                <div>
                  <span className="font-bold text-gray-800 block">VIA APP:</span>
                  <ol className="list-decimal ml-5 space-y-0.5">
                    <li>Bill Payments &rarr; More Payments &rarr; Choose <span className="font-semibold text-blue-600">TNCC</span></li>
                    <li>Insert Reference Number</li>
                  </ol>
                </div>
                <div>
                  <span className="font-bold text-gray-800 block">VIA POS TERMINAL:</span>
                  <ol className="list-decimal ml-5 space-y-0.5">
                    <li>Online transactions &rarr; Choose <span className="font-semibold text-blue-600">TNCC</span> &rarr; Insert Reference</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Building size={16} />
                BRANCH - TELLER
              </div>
              <ol className="list-decimal ml-5 text-xs text-gray-700 space-y-1">
                <li>Submit Institution Name <span className="font-semibold text-blue-600">TNCC</span> and Control/Reference Number.</li>
                <li>Teller pays through Online Billers &rarr; <span className="font-semibold text-blue-600">TNCC</span> &rarr; Control Number.</li>
              </ol>
            </div>
          </div>

          {/* M-Pesa & Tigo Pesa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Smartphone size={16} />
                FOR VODACOM (M-PESA)
              </div>
              <ol className="list-decimal ml-5 text-xs text-gray-700 space-y-1">
                <li>Dial (Piga) <span className="font-semibold text-blue-600">*150*00#</span></li>
                <li>Enter 1 [Send money] &rarr; 3 [To bank] &rarr; 1 [CRDB]</li>
                <li>Enter 2 [Enter Control Number]</li>
                <li>Enter your reference / payment number</li>
                <li>Enter amount &rarr; Enter PIN &rarr; Confirm</li>
              </ol>
            </div>

            <div className="p-3 border rounded bg-gray-50">
              <div className="font-semibold text-blue-700 text-sm mb-1.5 flex items-center gap-1.5">
                <Smartphone size={16} />
                FOR TIGO PESA
              </div>
              <ol className="list-decimal ml-5 text-xs text-gray-700 space-y-1">
                <li>Dial (Piga) <span className="font-semibold text-blue-600">*150*01#</span></li>
                <li>Enter 4 [Lipa Bill / Pay Bill] &rarr; 3 [Ingiza Namba Ya Kampuni]</li>
                <li>Enter <span className="font-semibold text-blue-600">900600</span></li>
                <li>Enter reference number &rarr; Enter amount &rarr; PIN to Confirm</li>
              </ol>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
