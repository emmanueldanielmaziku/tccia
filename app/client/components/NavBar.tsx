"use client";
import {
  ShieldTick,
  SidebarLeft,
  SidebarRight,
  Notification,
  ArrowDown2,
  HamburgerMenu,
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import useLangState from "@/app/services/LanguageState";
import { useState } from "react";
import { useTranslations } from "next-intl";

type NavBarProps = {
  title: string;
};

export default function NavBar({ title }: NavBarProps) {
  const { isMenuOpen, toggleMenu } = useMenuState();
  const { language, toggleLanguage } = useLangState();
  const [langDrop, toggleDropBox] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const t = useTranslations();
  const tn = useTranslations("nav");

  return (
    <nav className="bg-gray-50/5 flex flex-row justify-between items-center absolute z-20 h-[65px] left-0 right-0 top-0 border-b-[1px] border-b-gray-200 px-4 w-full backdrop-blur-md">
      <div className="flex items-center flex-row">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-gray-50 border-gray-100 hover:bg-blue-100 mr-3 border-[0.5px] cursor-pointer md:hidden"
        >
          <HamburgerMenu size="24" color="black" />
        </button>

        {/* Desktop Menu Button */}
        <button
          onClick={toggleMenu}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-[12px] bg-gray-50 border-gray-100 hover:bg-blue-100 mr-3 border-[0.5px] cursor-pointer"
        >
          {isMenuOpen ? (
            <SidebarLeft
              size="25"
              color="gray"
              variant="Outline"
              className="transition-all duration-300"
            />
          ) : (
            <SidebarRight
              size="25"
              color="#2b76f0"
              variant="Outline"
              className="transition-all duration-300"
            />
          )}
        </button>

        <div className="h-[25px] max-h-[25px] bg-zinc-300 w-[1px] max-w-[1px]"></div>
        <div className="px-4 text-zinc-600">{title}</div>
      </div>

      <div className="flex flex-row items-center">
        {/* Language Selector */}
        <button
          className="flex flex-row items-center justify-between h-10.5 md:w-[100px] w-[60px] px-2 gap-1.5 rounded-[12px] bg-gray-100 hover:bg-gray-200 mr-5 cursor-pointer border-1 border-zinc-200 relative"
          onMouseOver={() => toggleDropBox(true)}
          onMouseLeave={() => toggleDropBox(false)}
        >
          <div className="flex flex-row items-center md:w-[40px] gap-1.5">
            {language === "EN" ? (
              <img
                src="/icons/square.png"
                alt="English Flag"
                className="w-6 h-6 transition-all duration-300"
              />
            ) : (
              <img
                src="/icons/tanzania.png"
                alt="Swahili Flag"
                className="w-6 h-6 transition-all duration-300"
              />
            )}
            <span className="text-sm font-semibold text-gray-500 md:flex hidden">
              {language}
            </span>
          </div>
          <ArrowDown2 size="18" color="gray" className="md:flex hidden" />
          {langDrop && (
            <div className="bg-white shadow-sm w-[100px] p-1 rounded-[10px] flex flex-col absolute top-10.5 border-[0.5px] left-0 z-10 transition-all duration-300">
              <div
                className="flex flex-row items-center gap-1.5 hover:bg-blue-100 p-2 rounded-[8px] cursor-pointer"
                onClick={() => language === "SW" && toggleLanguage()}
              >
                <img
                  src="/icons/square.png"
                  alt="English Flag"
                  className="w-6 h-6"
                />
                <span className="text-sm font-semibold text-gray-500">EN</span>
                <span
                  className={`w-2 max-w-2 max-h-2 h-2 rounded-full ${
                    language === "EN" ? "bg-blue-500" : "bg-transparent"
                  }`}
                ></span>
              </div>
              <div
                className="flex flex-row items-center gap-1.5 hover:bg-blue-100 p-2 rounded-[8px] cursor-pointer"
                onClick={() => language === "EN" && toggleLanguage()}
              >
                <img
                  src="/icons/tanzania.png"
                  alt="Swahili Flag"
                  className="w-6 h-6"
                />
                <span className="text-sm font-semibold text-gray-500">SW</span>
                <span
                  className={`w-2 max-w-2 max-h-2 h-2 rounded-full ${
                    language === "SW" ? "bg-blue-500" : "bg-transparent"
                  }`}
                ></span>
              </div>
            </div>
          )}
        </button>

        <div className="h-[25px] max-h-[25px] bg-zinc-300 w-[1px] max-w-[1px]"></div>

        {/* User Profile */}
        <div className="relative">
          {/* Mobile Profile Avatar */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="md:hidden flex items-center justify-center"
          >
            <img
              src="https://avatar.iran.liara.run/public"
              alt="User Profile"
              className="w-9 h-9 rounded-full"
            />
          </button>

          {/* Desktop Profile */}
          <div className="hidden md:flex flex-row items-center justify-center gap-2 cursor-default px-6">
            <img
              src="https://avatar.iran.liara.run/public"
              alt="User Profile"
              className="w-9 h-9 rounded-full"
            />
            <div className="flex flex-col items-left justify-center">
              <div className="font-semibold text-[15px] text-gray-700">
                Emmanuel Daniel
              </div>
              <div className="flex flex-row items-center gap-1 text-gray-500 text-[12px]">
                <span>{tn("exporterManager")}</span>
                <ShieldTick size="14" color="#FF8A65" variant="Bold" />
              </div>
            </div>
          </div>

          {/* Mobile Profile Popover */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 md:hidden">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="font-semibold text-gray-700">
                  Emmanuel Daniel
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <span>{tn("exporterManager")}</span>
                  <ShieldTick size="14" color="#FF8A65" variant="Bold" />
                </div>
              </div>
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Notifications
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
