"use client";

import { useEffect, useState, useCallback } from "react";
import NavBar from "../../components/NavBar";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useRightSidebar } from "../../../contexts/RightSidebarContext";
import WalletSidebar from "./components/WalletSidebar";
import { Wallet, ReceiptText, HandCoins, FileText, Copy, Check, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WalletStatusState = {
  acceptedTerms: boolean;
  balance: string | number;
  accountName: string;
  state: string;
  transactions: Transaction[];
};

type Transaction = {
  date: string;
  amount: number;
  type: string;
  reference: string;
  state: string;
};

function extractWalletStatus(payload: any): WalletStatusState {
  const data = payload ?? {};
  
  const acceptedTerms = Boolean(data.tc_accepted || data.accepted_terms || false);
  const balance = data.balance ?? 0;
  const accountName = data.company_name ?? data.name ?? "-";
  const state = data.state ?? "inactive";
  const transactions = Array.isArray(data.transactions) ? data.transactions : [];

  return {
    acceptedTerms,
    balance,
    accountName,
    state,
    transactions,
  };
}

function getSelectedCompanyId(userProfileCompanyId?: number): number | null {
  try {
    const stored = localStorage.getItem("selectedCompany");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return userProfileCompanyId ?? null;
}

export default function TcciaWalletPage() {
  const { userProfile, loading: userProfileLoading } = useUserProfile();
  const { isRightSidebarOpen } = useRightSidebar();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatusState>({
    acceptedTerms: false,
    balance: 0,
    accountName: "-",
    state: "inactive",
    transactions: [],
  });

  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [printingLoading, setPrintingLoading] = useState<{[key: string]: boolean}>({});
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handlePrintInvoice = async (reference: string) => {
    if (!reference) return;
    setPrintingLoading(prev => ({ ...prev, [reference]: true }));
    try {
      const response = await fetch("/api/invoice/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer gm4W92IYQlsjPxbqxA_hMjBr0G47bO_K_YoqF1u6RrQ"
        },
        body: JSON.stringify({ payment_reference: reference })
      });
      const data = await response.json();
      if (data.result && data.result.success) {
        localStorage.setItem(`invoice_${reference}`, JSON.stringify(data.result.data));
        window.open(`/invoice/print?reference=${reference}`, "_blank");
      } else {
        alert("Failed to fetch invoice details: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("An error occurred while fetching invoice details.");
    } finally {
      setPrintingLoading(prev => ({ ...prev, [reference]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadStatus = useCallback(async () => {
    const companyId = getSelectedCompanyId(userProfile?.company_id);
    if (!companyId) {
      setStatusError("Company ID not found. Please contact support.");
      setFirstLoadDone(true);
      return;
    }

    setStatusError(null);
    try {
      const response = await fetch(`/api/wallet/status?company_id=${companyId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load wallet status.",
        );
      }
      setStatus(extractWalletStatus(data));
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Failed to load wallet status.",
      );
    } finally {
      setFirstLoadDone(true);
    }
  }, [userProfile?.company_id]);

  useEffect(() => {
    if (!userProfile) return;
    loadStatus();
  }, [userProfile, loadStatus]);

  const handleAcceptTerms = async () => {
    const companyId = getSelectedCompanyId(userProfile?.company_id);
    if (!companyId) {
      setStatusError("Company ID not found. Please contact support.");
      return;
    }

    setAcceptingTerms(true);
    setStatusError(null);
    try {
      const response = await fetch("/api/wallet/accept_terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to accept terms.",
        );
      }
      await loadStatus();
    } catch (error) {
      setStatusError(
        error instanceof Error ? error.message : "Failed to accept terms.",
      );
    } finally {
      setAcceptingTerms(false);
    }
  };

  const handleDeposit = async () => {
    const companyId = getSelectedCompanyId(userProfile?.company_id);
    if (!companyId) {
      setDepositError("Company ID not found. Please contact support.");
      return;
    }

    setDepositError(null);
    setPaymentReference(null);
    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 9500 || parsedAmount > 10000000) {
      setDepositError("Enter a valid amount between 9500 and 10,000,000.");
      return;
    }

    setDepositLoading(true);
    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          company_id: companyId,
          amount: parsedAmount 
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to create deposit request.",
        );
      }

      const ref =
        data?.payment_reference ??
        data?.reference ??
        data?.data?.payment_reference ??
        data?.data?.reference ??
        data?.result?.payment_reference ??
        data?.result?.reference ??
        data?.result?.data?.bill_reference ??
        data?.result?.data?.reference;

      if (!ref) {
        throw new Error(
          "Deposit created but payment reference was not returned.",
        );
      }

      setPaymentReference(String(ref));
      await loadStatus();
    } catch (error) {
      setDepositError(
        error instanceof Error
          ? error.message
          : "Failed to create deposit request.",
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const filteredTransactions = status.transactions.filter(
    (transaction) => {
      const matchType = typeFilter === "all" || transaction.type === typeFilter;
      const matchStatus = statusFilter === "all" || transaction.state === statusFilter;
      return matchType && matchStatus;
    }
  );

  return (
    <main className="w-full h-[97vh] rounded-[12px] sm:rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title="TNCC Wallet" />
      <section className="flex flex-col lg:flex-row">
        <div className="flex-1 pt-20 px-4 sm:px-6 md:px-8 lg:px-12 overflow-y-auto pb-8 min-w-0">
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  TNCC Wallet
                </h1>
                <p className="text-sm text-gray-500">
                  Accept terms, view wallet status, and generate a deposit
                  reference.
                </p>
              </div>
            </div>

            {userProfileLoading ? (
              <div className="text-gray-600">Loading user profile...</div>
            ) : !firstLoadDone ? (
              <div className="text-gray-600">Loading wallet status...</div>
            ) : (
              <>
                {statusError && (
                  <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-3">
                    {statusError}
                  </div>
                )}

                {!status.acceptedTerms ? (
                  <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <FileText size={18} />
                      Terms Acceptance Required
                    </div>
                    <p className="text-sm text-gray-600">
                      You must accept wallet terms and conditions before
                      accessing wallet services.
                    </p>
                    <button
                      onClick={handleAcceptTerms}
                      disabled={acceptingTerms}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                    >
                      {acceptingTerms ? "Accepting..." : "Accept Terms"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="text-sm text-gray-500 mb-2">
                          Available Balance
                        </div>
                        <div className="text-3xl font-bold text-blue-700">
                          {String(status.balance)}
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="text-sm text-gray-500 mb-2">
                          Company Name
                        </div>
                        <div className="font-semibold text-gray-800">
                          {status.accountName}
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="text-sm text-gray-500 mb-2">
                          Wallet Status
                        </div>
                        <div className={`font-semibold ${status.state === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                          {status.state.charAt(0).toUpperCase() + status.state.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-5 bg-white">
                      <div className="flex items-center gap-2 font-medium text-gray-800 mb-4">
                        <HandCoins size={18} />
                        Deposit
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          min="9500"
                          max="10000000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-80"
                          placeholder="Enter amount"
                        />
                        <button
                          onClick={handleDeposit}
                          disabled={depositLoading}
                          className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 cursor-pointer"
                        >
                          {depositLoading ? "Processing..." : "Deposit"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum amount is 9,500 and maximum is 10,000,000.
                      </p>
                      {depositError && (
                        <p className="text-sm text-red-600 mt-2">
                          {depositError}
                        </p>
                      )}
                      {paymentReference && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center gap-2 text-green-800 font-medium">
                            <ReceiptText size={16} />
                            Payment Reference
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-green-900 font-mono">
                              {paymentReference}
                            </span>
                            <button
                              onClick={() => copyToClipboard(paymentReference)}
                              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 cursor-pointer transition-colors"
                            >
                              {copied ? (
                                <Check size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                              {copied ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {status.transactions.length > 0 && (
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center font-medium text-gray-800 mb-4 gap-3">
                          <div className="flex items-center gap-2">
                            <ReceiptText size={18} />
                            Transaction History
                          </div>
                          <div className="flex w-full sm:w-auto gap-2">
                            <div className="w-full sm:w-[160px]">
                              <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full text-xs py-1 h-8">
                                  <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="deposit">Deposits</SelectItem>
                                    <SelectItem value="payment">Payments</SelectItem>
                                    <SelectItem value="adjustment">Adjustments</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-full sm:w-[160px]">
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full text-xs py-1 h-8">
                                  <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="not_paid">Not Paid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto max-h-120 overflow-y-auto pr-2">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white">
                              <tr className="border-b border-gray-200 text-left text-gray-500">
                                <th className="pb-3 font-medium">Type</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium">Reference</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right">Amount</th>
                                <th className="pb-3 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTransactions.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                                    No transactions found matching the selected filters.
                                  </td>
                                </tr>
                              ) : (
                                filteredTransactions.map((transaction, index) => {
                                  const badgeClass =
                                    transaction.state === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700";
                                  const amountClass =
                                    transaction.type === "deposit"
                                      ? "text-green-600"
                                      : "text-red-600";

                                  return (
                                    <tr key={index} className="border-b border-gray-100">
                                      <td className="py-3 capitalize font-medium text-gray-800">
                                        {transaction.type}
                                      </td>
                                      <td className="py-3 text-gray-600">{transaction.date}</td>
                                      <td className="py-3 text-gray-600">{transaction.reference}</td>
                                      <td className="py-3">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}
                                        >
                                          {transaction.state}
                                        </span>
                                      </td>
                                      <td className={`py-3 text-right font-semibold ${amountClass}`}>
                                        {transaction.amount === 0 ? "" : (transaction.type === "deposit" ? "+" : "-")}
                                        {Math.abs(transaction.amount)}
                                      </td>
                                      <td className="py-3 text-right">
                                        {transaction.reference ? (
                                          <button
                                            onClick={() => handlePrintInvoice(transaction.reference)}
                                            disabled={printingLoading[transaction.reference]}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                          >
                                            {printingLoading[transaction.reference] ? (
                                              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                              <Printer size={13} />
                                            )}
                                            <span>Print Invoice</span>
                                          </button>
                                        ) : (
                                          <span className="text-gray-400 text-xs font-normal">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {isRightSidebarOpen && (
          <WalletSidebar onCompanyChange={loadStatus} balance={status.balance} />
        )}
      </section>
    </main>
  );
}
