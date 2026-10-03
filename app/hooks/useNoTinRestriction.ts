"use client";

import { useEffect, useState } from "react";

/**
 * Module codes that remain accessible when the user has only selected a
 * No-TIN company. Every other module is locked in that state.
 *
 * Company Registration and Membership are permitted so the trader can either
 * add a TIN company later or apply for membership; NTB, Business Complaints,
 * IT Support, TNCC Wallet and Profile are always-accessible modules.
 */
export const NO_TIN_ALLOWED_MODULES = [
  "company_registration",
  "membership",
] as const;

/**
 * IDs of the always-accessible menu items that must stay unlocked even when
 * only a No-TIN company is selected.
 */
export const NO_TIN_ALLOWED_MENU_IDS = [
  "Company Registration",
  "Employees Management",
  "Membership",
  "Non-Tariff Barrier",
  "Business Complaints",
  "IT Support",
  "TNCC Wallet",
  "Profile",
] as const;

type StoredCompany = {
  id?: number;
  company_tin?: string | null;
  has_tin?: boolean | null;
};

/**
 * Reference prefix used by the backend for companies registered without a TIN
 * (e.g. "NT-000001"). This is the most reliable client-side signal, so it takes
 * priority over the `has_tin` flag and over an empty `company_tin`.
 */
export const NO_TIN_TIN_PREFIX = "NT-";

/**
 * Determines whether a company has no TIN.
 *
 * Detection order (defensive, works across environments):
 *   1. A TIN starting with "NT-" => No-TIN (authoritative reference format).
 *   2. Otherwise trust `has_tin` when the backend provides it.
 *   3. Otherwise fall back to an empty/absent `company_tin`.
 */
export function companyHasNoTin(company: StoredCompany | null | undefined): boolean {
  if (!company) return false;

  const tin = (company.company_tin ?? "").trim();
  if (tin.toUpperCase().startsWith(NO_TIN_TIN_PREFIX)) {
    return true;
  }

  if (typeof company.has_tin === "boolean") {
    return company.has_tin === false;
  }

  return tin === "";
}

/**
 * Reads the currently selected company from localStorage and determines
 * whether it is a No-TIN company.
 */
function detectNoTin(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("selectedCompany");
    if (!stored) return false;

    return companyHasNoTin(JSON.parse(stored) as StoredCompany);
  } catch {
    return false;
  }
}

/**
 * Hook that exposes whether the currently selected company has no TIN, and
 * whether a given module should therefore be locked.
 *
 * Re-evaluates on company changes and login refreshes so the sidebar reacts
 * immediately after selecting a company or finishing a registration.
 */
export function useNoTinRestriction() {
  const [isNoTinSelected, setIsNoTinSelected] = useState<boolean>(() =>
    detectNoTin(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refresh = () => setIsNoTinSelected(detectNoTin());

    window.addEventListener("COMPANY_CHANGE_EVENT", refresh);
    window.addEventListener("USER_LOGIN_EVENT", refresh);
    window.addEventListener("COMPANY_REGISTERED_EVENT", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", refresh);
      window.removeEventListener("USER_LOGIN_EVENT", refresh);
      window.removeEventListener("COMPANY_REGISTERED_EVENT", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /**
   * Returns true when the module must be locked because only a No-TIN company
   * is selected.
   *
   * @param moduleCode - the module code (e.g. "certificate_origin")
   * @param menuId - the menu item id (e.g. "Certificate of Origin")
   */
  const isLockedForNoTin = (moduleCode?: string | null, menuId?: string) => {
    if (!isNoTinSelected) return false;

    // Always-accessible menu items stay unlocked.
    if (
      menuId &&
      (NO_TIN_ALLOWED_MENU_IDS as readonly string[]).includes(menuId)
    ) {
      return false;
    }

    // Allowlisted module codes stay unlocked.
    if (
      moduleCode &&
      (NO_TIN_ALLOWED_MODULES as readonly string[]).includes(moduleCode)
    ) {
      return false;
    }

    return true;
  };

  return { isNoTinSelected, isLockedForNoTin };
}

export default useNoTinRestriction;
