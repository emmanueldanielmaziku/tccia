"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ArchiveBook,
  Box,
  Building,
  Direct,
  Lifebuoy,
  LogoutCurve,
  People,
  Setting2,
  User,
  UserTick,
  Lock,
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import Link from "next/link";
import useLogState from "../services/LogoutState";
import { useTranslations } from "next-intl";
import useMobileState from "../services/MobileState";
import { useUserPermissions } from "../../hooks/useUserPermissions";

export default function SideBarMobile() {
  // Fetch certificates on company change
  const { isMenuOpen, toggleMenu } = useMenuState();
  const { alertState, toggleAlert } = useLogState();
  const { isMobile, toggleMobileView } = useMobileState();
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState("");
  const [role, setRole] = useState("CEM");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companySelected, setCompanySelected] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("selectedCompany");
    }
    return false;
  });
  const t = useTranslations("sidebar");
  const ta = useTranslations("alerts");
  const { canView, getUserModules } = useUserPermissions();

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

  // Function to get the active tab based on current pathname
  const getActiveTabFromPathname = (currentPath: string) => {
    if (currentPath.includes("/client/firm-management")) return "Company Registration";
    if (currentPath.includes("/client/factory-verification")) return "Factory Verification";
    if (currentPath.includes("/client/coo")) return "Certificate of Origin";
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
    },
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

    // If module has a code, check if user has access to it
    if (item.moduleCode) {
      return !canView(item.moduleCode);
    }

    // If no module code and not always accessible, check if user has any modules
    const userModules = getUserModules();
    return userModules.length === 0;
  };

  const handleTabClick = (id: string) => {
    setSelectedTab((prev) => (prev === id ? id : id));
    // Close the mobile menu when a menu item is tapped
    // This will trigger navigation and close the overlay
    if (isMenuOpen) {
      toggleMenu();
    }
  };

  return (
    <div
      className="bg-gray-50 h-full z-50 p-6 flex flex-col justify-between transition-all duration-300 w-[340px]"
    >
      <div className="flex flex-col">
        {/* Logo */}
        <div className="flex flex-row justify-start items-center gap-4">
          <img src="/icons/LOGO.png" alt="Logo" className="w-15 h-15" />
          <div>
            <h1 className="font-bold text-xl text-gray-700 truncate">
              {t("dashboardTitle")}
            </h1>
            <div className="text-gray-500">{t("dashboard")}</div>
          </div>
        </div>

        {/* Modules */}
        <div className="mt-8">
          <h2 className="text-sm text-gray-500 mb-4">{t("modules")}</h2>
          <div className="flex flex-col gap-2.5">
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
              let lockMessage = t("lockMessages.selectCompany");
              if (isModuleAccessLocked) {
                if (userRole === "employee" && (item.id === "Company Registration" || item.id === "Employees Management")) {
                  lockMessage = t("lockMessages.accessRestrictedEmployee");
                } else if (item.moduleCode) {
                  lockMessage = t("lockMessages.noModuleAccess");
                } else {
                  lockMessage = t("lockMessages.accessRestricted");
                }
              }

              return (
                <div key={item.id} className="w-full flex flex-col items-end">
                  {isLocked ? (
                    <div
                      className="flex flex-row items-center h-[55px] w-full relative justify-between md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                      title={lockMessage}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <item.icon size="20" color="#b0b0b0" />
                        <span className="text-gray-400 text-sm truncate">
                          {t(item.translationKey)}
                        </span>
                      </div>
                      <Lock size="18" color="#b0b0b0" />
                    </div>
                  ) : (
                    <Link
                      href={item.route}
                      onClick={() => handleTabClick(item.id)}
                      className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative justify-between md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] ${
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
                          color={selectedTab === item.id ? "#0561f5" : "#364153"}
                        />
                        <span className="text-gray-700 text-sm truncate">
                          {t(item.translationKey)}
                        </span>
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
        <Link
          href="/client/settings"
          onClick={() => {
            if (isMenuOpen) {
              toggleMenu();
            }
          }}
          className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative justify-between md:gap-2 px-4 md:rounded-[10px] rounded-[8px] border-[0.5px] border-gray-200 hover:bg-blue-50 hover:border-blue-300`}
        >
          <div className="flex flex-row items-center gap-2">
            <Setting2 size="20" color="#364153" />
            <span className="text-gray-700 text-sm truncate">
              {t("settings")}
            </span>
          </div>
        </Link>
        <button
          onClick={() => {
            toggleAlert();
            if (isMenuOpen) {
              toggleMenu();
            }
          }}
          className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative justify-between md:gap-2 px-4 rounded-[8px] md:rounded-[10px] border-[0.5px] border-gray-200 hover:bg-blue-50 hover:border-blue-300`}
        >
          <div className="flex flex-row items-center gap-2">
            <LogoutCurve size="20" color="#364153" />
            <span className="text-gray-700 text-sm truncate">
              {ta("logout")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
