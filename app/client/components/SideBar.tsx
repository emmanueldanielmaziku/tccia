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
  User,
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import Link from "next/link";
import useLogState from "../services/LogoutState";
import { useTranslations } from "next-intl";
import useMobileState from "../services/MobileState";
import { useUserPermissions } from "../../hooks/useUserPermissions";

export default function SideBar() {
  // Fetch certificates on company change
  const { isMenuOpen } = useMenuState();
  const { alertState, toggleAlert } = useLogState();
  const { isMobile, toggleMobileView } = useMobileState();
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState("");
  const [role, setRole] = useState("CEM");
  const [userRole, setUserRole] = useState<string | null>(null);
  const t = useTranslations("sidebar");
  const ta = useTranslations("alerts");
  const { canView, getUserModules } = useUserPermissions();
  const [companySelected, setCompanySelected] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("selectedCompany");
    }
    return false;
  });

  // Get user role from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole");
      setUserRole(storedRole);
    }
  }, []);

  // Listen for login events to refresh user role
  useEffect(() => {
    const handleLogin = () => {
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem("userRole");
        setUserRole(storedRole);
      }
    };

    window.addEventListener("USER_LOGIN_EVENT", handleLogin);
    return () => {
      window.removeEventListener("USER_LOGIN_EVENT", handleLogin);
    };
  }, []);

  // Function to get the active tab based on current pathname
  const getActiveTabFromPathname = (currentPath: string) => {
    if (currentPath.includes("/client/firm-management")) return "Company Registration";
    if (currentPath.includes("/client/factory-verification")) return "Factory Verification";
    if (currentPath.includes("/client/coo")) return "Certificate of Origin";
    if (currentPath.includes("/client/employees")) return "Employees Management";
    if (currentPath.includes("/client/membership")) return "Membership";
    if (currentPath.includes("/client/ntb")) return "Non-Tariff Barrier";
    if (currentPath.includes("/client/business-complaints")) return "Business Complaints";
    if (currentPath.includes("/client/report")) return "IT Support";
    if (currentPath.includes("/client/profile")) return "Profile";
    return "Company Registration";
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

  // Map menu items to module codes for permission checking
  const menuItems = [
    {
      id: "Company Registration",
      translationKey: "firmManagement",
      icon: Building,
      route: "/client/firm-management",
      moduleCode: "company_registration",
      alwaysAccessible: false,
    },
    {
      id: "Employees Management",
      translationKey: "employeesManagement",
      icon: UserTick,
      route: "/client/employees",
      moduleCode: null, // No module code - access controlled by role
      alwaysAccessible: false,
    },
    {
      id: "Factory Verification",
      translationKey: "factoryVerification",
      icon: Box,
      route: "/client/factory-verification",
      moduleCode: "factory_verification",
      alwaysAccessible: false,
    },
    {
      id: "Certificate of Origin",
      translationKey: "certificateOfOrigin",
      icon: ArchiveBook,
      route: "/client/coo",
      moduleCode: "certificate_origin",
      alwaysAccessible: false,
    },
    {
      id: "Membership",
      translationKey: "membership",
      icon: People,
      route: "/client/membership",
      moduleCode: "membership",
      alwaysAccessible: false,
    },
    {
      id: "Non-Tariff Barrier",
      translationKey: "nonTariffBarrier",
      icon: Direct,
      route: "/client/ntb",
      moduleCode: null, // Always accessible
      alwaysAccessible: true,
    },
    {
      id: "Business Complaints",
      translationKey: "businessComplaints",
      icon: Lifebuoy,
      route: "/client/business-complaints",
      moduleCode: null, // Always accessible
      alwaysAccessible: true,
    },
    {
      id: "IT Support",
      translationKey: "reportProblem",
      icon: Lifebuoy,
      route: "/client/report",
      moduleCode: null, // Always accessible
      alwaysAccessible: true,
    },
    {
      id: "Profile",
      translationKey: "profile",
      icon: User,
      route: "/client/profile",
      moduleCode: null, // Always accessible
      alwaysAccessible: true,
    }
  ];

  // Check if a menu item should be locked
  const isModuleLocked = (item: typeof menuItems[0]): boolean => {
    // Profile, IT Support, Business Complaints, and NTB are always accessible
    if (item.alwaysAccessible) {
      return false;
    }

    // For employees, lock Company Registration and Employees Management by default
    if (userRole === "employee") {
      if (item.id === "Company Registration" || item.id === "Employees Management") {
        return true;
      }
    }

    // Traders should have access to Company Registration even without the module in their modules array
    if (userRole === "trader" && item.id === "Company Registration") {
      return false;
    }

    // If module has a code, check if user has access to it
    if (item.moduleCode) {
      return !canView(item.moduleCode);
    }

    // If no module code and not always accessible, check if user has any modules
    // (for modules without codes, we allow access if user has any modules)
    const userModules = getUserModules();
    return userModules.length === 0;
  };

  const handleTabClick = (id: string) => {
    setSelectedTab((prev) => (prev === id ? id : id));
  };

  return (
    <div
      className={`bg-gray-50 h-full p-3 sm:p-4 md:p-6 flex-col justify-between transition-all duration-300
        md:flex hidden flex-shrink-0
        ${isMenuOpen ? "md:w-[280px] lg:w-[320px] xl:w-[340px]" : "md:w-[80px] lg:w-[100px] xl:w-[120px]"}`}
    >
      <div className="flex flex-col">
        {/* Logo */}
        <div className="flex flex-row justify-start items-center gap-2 md:gap-4">
          <img src="/icons/LOGO.png" alt="Logo" className="w-12 h-12 md:w-15 md:h-15" />
          {isMenuOpen && (
            <div>
              <h1 className="font-bold text-lg md:text-xl text-gray-700 truncate">
                TNCC'S CLIENT
              </h1>
              <div className="text-sm md:text-base text-gray-500">{t("dashboard")}</div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">{t("modules")}</h2>
          <div className="flex flex-col gap-2 md:gap-2.5">
            {menuItems.map((item) => {
              const isFirmManagement = item.id === "Company Registration";
              const isNTB = item.id === "Non-Tariff Barrier";
              const isBusinessComplaints = item.id === "Business Complaints";
              const isHelpDesk = item.id === "IT Support";
              const isProfile = item.id === "Profile";

              // Check if module is locked due to permissions or role restrictions
              const isModuleAccessLocked = isModuleLocked(item);
              
              // Check if module is locked due to no company selected (for modules that require company)
              const isCompanyLocked =
                !companySelected &&
                !isFirmManagement &&
                !isNTB &&
                !isBusinessComplaints &&
                !isHelpDesk &&
                !isProfile;

              const isLocked = isModuleAccessLocked || isCompanyLocked;

              // Determine lock message
              let lockMessage = "Select a company to access this module";
              if (isModuleAccessLocked) {
                if (userRole === "employee" && (item.id === "Company Registration" || item.id === "Employees Management")) {
                  lockMessage = "Access restricted for employees";
                } else if (item.moduleCode) {
                  lockMessage = "You don't have access to this module";
                } else {
                  lockMessage = "Access restricted";
                }
              }

              return (
                <div key={item.id} className="w-full flex flex-col items-end">
                  {isLocked ? (
                    <div
                      className="flex flex-row items-center h-[45px] md:h-[55px] w-full relative justify-between gap-1 md:gap-2 px-3 md:px-4 rounded-[6px] md:rounded-[8px] lg:rounded-[10px] border-[0.5px] border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                      title={lockMessage}
                    >
                      <div className="flex flex-row items-center gap-1 md:gap-2">
                        <item.icon size="18" className="md:w-5 md:h-5" color="#b0b0b0" />
                        {isMenuOpen && (
                          <span className="text-gray-400 text-xs md:text-sm truncate">
                            {t(item.translationKey)}
                          </span>
                        )}
                      </div>
                      <Lock size="16" className="md:w-[18px] md:h-[18px]" color="#b0b0b0" />
                    </div>
                  ) : (
                    <Link
                      href={item.route}
                      onClick={() => handleTabClick(item.id)}
                      className={`cursor-pointer flex flex-row items-center h-[45px] md:h-[55px] w-full relative ${
                        isMenuOpen ? "justify-between" : "justify-center"
                      } gap-1 md:gap-2 px-3 md:px-4 rounded-[6px] md:rounded-[8px] lg:rounded-[10px] border-[0.5px] ${
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
                      <div className="flex flex-row items-center gap-1 md:gap-2">
                        <item.icon
                          size="18"
                          className="md:w-5 md:h-5"
                          color={
                            selectedTab === item.id ? "#0561f5" : "#364153"
                          }
                        />
                        {isMenuOpen && (
                          <span className="text-gray-700 text-xs md:text-sm truncate">
                            {t(item.translationKey)}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              );
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
