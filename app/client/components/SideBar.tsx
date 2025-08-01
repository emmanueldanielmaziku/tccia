"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArchiveBook,
  Box,
  Building,
  Direct,
  Lifebuoy,
  LogoutCurve,
  People,
  Profile2User,
  Setting2,
  UserTick,
  Lock,
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import Link from "next/link";
import useLogState from "../services/LogoutState";
import { useTranslations } from "next-intl";
import useMobileState from "../services/MobileState";

export default function SideBar() {
  // Fetch certificates on company change
  const { isMenuOpen } = useMenuState();
  const { alertState, toggleAlert } = useLogState();
  const { isMobile, toggleMobileView } = useMobileState();
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState("");
  const [role, setRole] = useState("CEM");
  const t = useTranslations("sidebar");
  const ta = useTranslations("alerts");
  const [companySelected, setCompanySelected] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("selectedCompany");
    }
    return false;
  });

  // Function to get the active tab based on current pathname
  const getActiveTabFromPathname = (currentPath: string) => {
    if (currentPath.includes("/client/firm-management")) return "Firm Management";
    if (currentPath.includes("/client/factory-verification")) return "Factory Verification";
    if (currentPath.includes("/client/coo")) return "Certificate of Origin";
    if (currentPath.includes("/client/membership")) return "Membership";
    if (currentPath.includes("/client/ntb")) return "Non-Tariff Barrier";
    if (currentPath.includes("/client/report")) return "Help Desk";
    return "Firm Management"; // Default fallback
  };

  // Set initial active tab based on current route
  useEffect(() => {
    const activeTab = getActiveTabFromPathname(pathname);
    setSelectedTab(activeTab);
  }, [pathname]);

  useEffect(() => {
    const handleCompanyChange = () => {
      setCompanySelected(!!localStorage.getItem("selectedCompany"));
    };
    window.addEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
  
    window.addEventListener("storage", handleCompanyChange);
    return () => {
      window.removeEventListener("COMPANY_CHANGE_EVENT", handleCompanyChange);
      window.removeEventListener("storage", handleCompanyChange);
    };
  }, []);

  const menuItems = [
    {
      id: "Firm Management",
      translationKey: "firmManagement",
      icon: Building,
      route: "/client/firm-management",
    },
    {
      id: "Factory Verification",
      translationKey: "factoryVerification",
      icon: Box,
      route: "/client/factory-verification",
    },
    {
      id: "Certificate of Origin",
      translationKey: "certificateOfOrigin",
      icon: ArchiveBook,
      route: "/client/coo",
    },
    // {
    //   id: "CFA Officers Management",
    //   translationKey: "cfaOfficersManagement",
    //   icon: Profile2User,
    //   route: "/client/exporter",
    // },

    // {
    //   id: "CFAs Management",
    //   translationKey: "cfasManagement",
    //   icon: Profile2User,
    //   route: "/client/cfa-management",
    // },

    // {
    //   id: "Employees Management",
    //   translationKey: "employeesManagement",
    //   icon: UserTick,
    //   route: "/client/employees",
    // },

    {
      id: "Membership",
      translationKey: "membership",
      icon: People,
      route: "/client/membership",
    },
    {
      id: "Non-Tariff Barrier",
      translationKey: "nonTariffBarrier",
      icon: Direct,
      route: "/client/ntb",
    },
    {
      id: "Help Desk",
      translationKey: "reportProblem",
      icon: Lifebuoy,
      route: "/client/report",
    }
  ];

  const handleTabClick = (id: string) => {
    setSelectedTab((prev) => (prev === id ? id : id));
  };

  return (
    <div
      className={`bg-gray-50 h-full p-6 flex-col justify-between transition-all duration-300
        md:flex hidden
        ${isMenuOpen ? "md:w-[340px]" : "md:w-[120px]"}`}
    >
      <div className="flex flex-col">
        {/* Logo */}
        <div className="flex flex-row justify-start items-center gap-4">
          <img src="/icons/LOGO.png" alt="Logo" className="w-15 h-15" />
          {isMenuOpen && (
            <div>
              <h1 className="font-bold text-xl text-gray-700 truncate">
                TCCIA'S CLIENT
              </h1>
              <div className="text-gray-500">{t("dashboard")}</div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="mt-8">
          <h2 className="text-sm text-gray-500 mb-4">{t("modules")}</h2>
          <div className="flex flex-col gap-2.5">
            {menuItems.map((item) => {
              const isFirmManagement = item.id === "Firm Management";
              const isNTB = item.id === "Non-Tariff Barrier";
              const isHelpDesk = item.id === "Help Desk";
              // const isMembership = item.id === "Membership";

              const isLocked = !companySelected && !isFirmManagement && !isNTB && !isHelpDesk;
              if (
                (role === "CEM" &&
                  [
                    "Factory Verification",
                    "Certificate of Origin",
                    "Firm Management",
                    // "Employees Management",
                    // "CFAs Management",
                    "Membership",
                    "Non-Tariff Barrier",
                    "Help Desk",
                  ].includes(item.id)) ||
                (role === "CEO" &&
                  [
                    "Factory Verification",
                    "Certificate of Origin",
                    "Firm Management",
                    "Membership",
                    "Non-Tariff Barrier",
                    "Report a Problem",
                  ].includes(item.id)) ||
                (role === "CFAM" &&
                  [
                    "Certificate of Origin",
                    "CFA Officers Management",
                    "Non-Tariff Barrier",
                    "Report a Problem",
                  ].includes(item.id)) ||
                (role === "CFAO" &&
                  [
                    "Certificate of Origin",
                    "Non-Tariff Barrier",
                    "Report a Problem",
                  ].includes(item.id))
              ) {
                return (
                  <div key={item.id} className="w-full flex flex-col items-end">
                    {isLocked ? (
                      <div
                        className="flex flex-row items-center h-[55px] w-full relative justify-between md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                        title="Select a company to access this module"
                      >
                        <div className="flex flex-row items-center gap-2">
                          <item.icon size="20" color="#b0b0b0" />
                          {isMenuOpen && (
                            <span className="text-gray-400 text-sm truncate">
                              {t(item.translationKey)}
                            </span>
                          )}
                        </div>
                        <Lock size="18" color="#b0b0b0" />
                      </div>
                    ) : (
                      <Link
                        href={item.route}
                        onClick={() => handleTabClick(item.id)}
                        className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
                          isMenuOpen ? "justify-between" : "justify-center"
                        } md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] ${
                          selectedTab === item.id
                            ? "bg-blue-100 border-blue-500"
                            : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                        aria-expanded={selectedTab === item.id}
                      >
                        <div
                          className={`w-1.5 h-6 max-h-6 rounded-tr-md rounded-br-md ${
                            selectedTab === item.id
                              ? "bg-blue-500"
                              : "bg-transparent"
                          } absolute left-0`}
                        ></div>
                        <div className="flex flex-row items-center gap-2">
                          <item.icon
                            size="20"
                            color={
                              selectedTab === item.id ? "#0561f5" : "#364153"
                            }
                          />
                          {isMenuOpen && (
                            <span className="text-gray-700 text-sm truncate">
                              {t(item.translationKey)}
                            </span>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      {/* Settings and Logout */}
      <div className="flex flex-col gap-2.5">
        {/* <Link
          href="/client/settings"
          className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
            isMenuOpen ? "justify-between" : "justify-center"
          } md:gap-2 px-4 md:rounded-[10px] rounded-[8px] border-[0.5px] border-gray-200 hover:bg-blue-50 hover:border-blue-300`}
        >
          <div className="flex flex-row items-center gap-2">
            <Setting2 size="20" color="#364153" />
            {isMenuOpen && (
              <span className="text-gray-700 text-sm truncate">
                {t("settings")}
              </span>
            )}
          </div>
        </Link> */}
        <button
          onClick={toggleAlert}
          className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
            isMenuOpen ? "justify-between" : "justify-center"
          } md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] border-gray-200 hover:bg-blue-50 hover:border-blue-300`}
        >
          <div className="flex flex-row items-center gap-2">
            <LogoutCurve size="20" color="#364153" />
            {isMenuOpen && (
              <span className="text-gray-700 text-sm truncate">
                {ta("logout")}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
