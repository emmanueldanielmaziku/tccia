"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import { useUserPermissions } from "../../../hooks/useUserPermissions";
import { Wallet, ReceiptText, HandCoins, FileText } from "lucide-react";

type WalletDetails = Record<string, unknown>;

type WalletStatusState = {
  acceptedTerms: boolean;
  balance: string | number;
  accountNumber: string;
  accountName: string;
  details: WalletDetails | null;
};

function extractWalletStatus(payload: any): WalletStatusState {
  const data = payload?.data ?? payload?.result?.data ?? payload?.wallet ?? payload ?? {};
  const acceptedTerms =
    Boolean(
      data?.terms_accepted ??
        data?.has_accepted_terms ??
        data?.accepted_terms ??
        data?.acceptedTerms
    ) || false;

  const balance = data?.balance ?? data?.wallet_balance ?? data?.available_balance ?? 0;
  const accountNumber =
    data?.account_number ?? data?.wallet_number ?? data?.wallet_account ?? "-";
  const accountName = data?.account_name ?? data?.wallet_name ?? data?.name ?? "-";

  return {
    acceptedTerms,
    balance,
    accountNumber,
    accountName,
    details: data && typeof data === "object" ? data : null,
  };
}

export default function TcciaWalletPage() {
  const { canView } = useUserPermissions();
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatusState>({
    acceptedTerms: false,
    balance: 0,
    accountNumber: "-",
    accountName: "-",
    details: null,
  });

  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [depositAmount, setDepositAmount] = useState("50000");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const canViewWallet = canView("tccia_wallet");

  const loadStatus = async () => {
    setLoading(true);
    setStatusError(null);
    try {
      const response = await fetch("/api/wallet/status");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to load wallet status.");
      }
      setStatus(extractWalletStatus(data));
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to load wallet status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canViewWallet) {
      setLoading(false);
      return;
    }
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewWallet]);

  const handleAcceptTerms = async () => {
    setAcceptingTerms(true);
    setStatusError(null);
    try {
      const response = await fetch("/api/wallet/accept_terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to accept terms.");
      }
      await loadStatus();
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to accept terms.");
    } finally {
      setAcceptingTerms(false);
    }
  };

  const handleDeposit = async () => {
    setDepositError(null);
    setPaymentReference(null);
    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDepositError("Enter a valid amount greater than zero.");
      return;
    }

    setDepositLoading(true);
    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to create deposit request.");
      }

      const ref =
        data?.payment_reference ??
        data?.reference ??
        data?.data?.payment_reference ??
        data?.data?.reference ??
        data?.result?.payment_reference ??
        data?.result?.reference;

      if (!ref) {
        throw new Error("Deposit created but payment reference was not returned.");
      }

      setPaymentReference(String(ref));
      await loadStatus();
    } catch (error) {
      setDepositError(
        error instanceof Error ? error.message : "Failed to create deposit request."
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const walletDetailEntries = useMemo(() => {
    if (!status.details) return [];
    return Object.entries(status.details).filter(
      ([key]) => !["balance", "wallet_balance", "available_balance"].includes(key)
    );
  }, [status.details]);

  return (
    <main className="w-full h-[97vh] rounded-[12px] sm:rounded-[14px] overflow-hidden bg-white border-[1px] border-gray-200 shadow-sm relative">
      <NavBar title="TCCIA Wallet" />
      <section className="flex h-full">
        <div className="flex-1 pt-20 px-4 sm:px-6 md:px-8 lg:px-12 overflow-y-auto pb-8">
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">TCCIA Wallet</h1>
                <p className="text-sm text-gray-500">
                  Accept terms, view wallet status, and generate a deposit reference.
                </p>
              </div>
            </div>

            {!canViewWallet ? (
              <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg p-4">
                You do not have permission to access the wallet module.
              </div>
            ) : loading ? (
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
                      You must accept wallet terms and conditions before accessing wallet services.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="text-sm text-gray-500 mb-2">Available Balance</div>
                        <div className="text-3xl font-bold text-blue-700">
                          {String(status.balance)}
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="text-sm text-gray-500 mb-2">Wallet Account</div>
                        <div className="font-semibold text-gray-800">{status.accountName}</div>
                        <div className="text-sm text-gray-600 mt-1">{status.accountNumber}</div>
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
                          min="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-60"
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
                      {depositError && (
                        <p className="text-sm text-red-600 mt-2">{depositError}</p>
                      )}
                      {paymentReference && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center gap-2 text-green-800 font-medium">
                            <ReceiptText size={16} />
                            Payment Reference
                          </div>
                          <div className="text-green-900 font-mono mt-1">{paymentReference}</div>
                        </div>
                      )}
                    </div>

                    {walletDetailEntries.length > 0 && (
                      <div className="border border-gray-200 rounded-xl p-5 bg-white">
                        <h2 className="font-medium text-gray-800 mb-3">Wallet Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {walletDetailEntries.map(([key, value]) => (
                            <div key={key} className="border border-gray-100 rounded-md p-3">
                              <div className="text-gray-500">{key}</div>
                              <div className="text-gray-800 font-medium break-all">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value ?? "-")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
