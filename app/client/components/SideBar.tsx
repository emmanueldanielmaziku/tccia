"use client";
import { useState } from "react";
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
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import Link from "next/link";
import useLogState from "../services/LogoutState";


export default function SideBar() {
  const { isMenuOpen } = useMenuState();
  const { alertState, toggleAlert } = useLogState();
  const [selectedTab, setSelectedTab] = useState("Factory Verification");
  const [role, setRole] = useState("CEM");

  const menuItems = [
    {
      id: "Factory Verification",
      icon: Box,
      route: "/client/factory-verification",
    },
    {
      id: "Certificate of Origin",
      icon: ArchiveBook,
      route: "/client/coo",
    },
    {
      id: "Firm Management",
      icon: Building,
      route: "/client/coo",
    },
    {
      id: "CFA Officers Management",
      icon: Profile2User,
      route: "/client/exporter",
    },
    {
      id: "CFAs Management",
      icon: Profile2User,
      route: "/client/exporter",
    },
    {
      id: "Employees Management",
      icon: UserTick,
      route: "/client/cfa",
    },
    {
      id: "Membership",
      icon: People,
      route: "/client/membership",
    },
    {
      id: "Non-Tariff Barrier",
      icon: Direct,
      route: "/client/ntb",
    },
    {
      id: "Report a Problem",
      icon: Lifebuoy,
      route: "/client/report",
    },
  ];

  const handleTabClick = (id: string) => {
    setSelectedTab((prev) => (prev === id ? id : id));

  };

  return (
    <div
      className={`bg-gray-50 h-full p-6 flex flex-col justify-between transition-all duration-300 ${
        isMenuOpen ? "w-[340px]" : "w-[120px]"
      }`}
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
              <div className="text-gray-500">Dashboard</div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="mt-8">
          <h2 className="text-sm text-gray-500 mb-4">Modules</h2>
          <div className="flex flex-col gap-2.5">
            {menuItems.map((item) =>
              role === "CEM" &&
              [
                "Factory Verification",
                "Certificate of Origin",
                "Firm Management",
                "Employees Management",
                "CFAs Management",
                "Membership",
                "Non-Tariff Barrier",
                "Report a Problem",
              ].includes(item.id) ? (
                <div key={item.id} className="w-full flex flex-col items-end">
                  <Link
                    href={item.route}
                    onClick={() => handleTabClick(item.id)}
                    className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
                      isMenuOpen ? "justify-between" : "justify-center"
                    } md:gap-2 px-4 md:rounded-[10px] border-[0.5px] ${
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
                      {isMenuOpen && (
                        <span className="text-gray-700 text-sm truncate">
                          {item.id}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : role === "CEO" &&
                [
                  "Factory Verification",
                  "Certificate of Origin",
                  "Firm Management",
                  "Membership",
                  "Non-Tariff Barrier",
                  "Report a Problem",
                ].includes(item.id) ? (
                <div key={item.id} className="w-full flex flex-col items-end">
                  <Link
                    href={item.route}
                    onClick={() => handleTabClick(item.id)}
                    className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
                      isMenuOpen ? "justify-between" : "justify-center"
                    } md:gap-2 px-4 md:rounded-[10px] border-[0.5px] ${
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
                      {isMenuOpen && (
                        <span className="text-gray-700 text-sm truncate">
                          {item.id}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : role === "CFAM" &&
                [
                  "Certificate of Origin",
                  "CFA Officers Management",
                  "Non-Tariff Barrier",
                  "Report a Problem",
                ].includes(item.id) ? (
                <div key={item.id} className="w-full flex flex-col items-end">
                  <Link
                    href={item.route}
                    onClick={() => handleTabClick(item.id)}
                    className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
                      isMenuOpen ? "justify-between" : "justify-center"
                    } md:gap-2 px-4 md:rounded-[10px] border-[0.5px] ${
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
                      {isMenuOpen && (
                        <span className="text-gray-700 text-sm truncate">
                          {item.id}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : role === "CFAO" &&
                [
                  "Certificate of Origin",
                  "Non-Tariff Barrier",
                  "Report a Problem",
                ].includes(item.id) ? (
                <div key={item.id} className="w-full flex flex-col items-end">
                  <Link
                    href={item.route}
                    onClick={() => handleTabClick(item.id)}
                    className={`cursor-pointer flex flex-row items-center h-[55px] w-full relative ${
                      isMenuOpen ? "justify-between" : "justify-center"
                    } md:gap-2 px-4 md:rounded-[10px] border-[0.5px] ${
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
                      {isMenuOpen && (
                        <span className="text-gray-700 text-sm truncate">
                          {item.id}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4">
        <Link
          href="/client/settings"
          onClick={() => setSelectedTab("Settings")}
          className={`cursor-pointer flex flex-row items-center relative ${
            isMenuOpen ? "justify-start" : "justify-center"
          } md:gap-2 py-4 px-4 md:rounded-[10px] border-[0.5px] ${
            selectedTab === "Settings"
              ? "bg-blue-100 border-blue-500"
              : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
          }`}
        >
          <div
            className={`w-1.5 h-6 max-h-6 rounded-tr-md rounded-br-md ${
              selectedTab === "Settings" ? "bg-blue-500" : "bg-transparent"
            } absolute left-0`}
          ></div>
          <Setting2
            size="20"
            color={selectedTab === "Settings" ? "#0561f5" : "#6e6d6d"}
          />
          {isMenuOpen && (
            <span className="text-gray-700 text-sm truncate">Settings</span>
          )}
        </Link>

        <Link
          href="#"
          onClick={toggleAlert}
          className={`cursor-pointer flex flex-row items-center relative ${
            isMenuOpen ? "justify-start" : "justify-center"
          } md:gap-2 py-4 px-4 md:rounded-[10px] border-[0.5px] ${
            alertState
              ? "bg-red-100 border-red-500"
              : "border-gray-200 hover:bg-red-50 hover:border-red-300"
          }`}
        >
          <div
            className={`w-1.5 h-6 max-h-6 rounded-tr-md rounded-br-md ${
              alertState ? "bg-red-500" : "bg-transparent"
            } absolute left-0`}
          ></div>
          <LogoutCurve size="20" color="red" />
          {isMenuOpen && (
            <span className="text-red-500 text-sm truncate">Logout</span>
          )}
        </Link>
      </div>
    </div>
  );
}
