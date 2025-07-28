"use client";
import {
  ShieldTick,
  SidebarLeft,
  SidebarRight,
  ArrowDown2,
  HamburgerMenu,
  ProfileCircle,
} from "iconsax-reactjs";
import useMenuState from "../services/MenuState";
import useLangState from "@/app/services/LanguageState";
import useLogState from "../services/LogoutState";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SideBarMobile from "./SideBar-Mobile";
import Link from "next/link";
import HSCodeWidget from "../(modules)/factory-verification/components/HSCodeWidget";
import { createPortal } from "react-dom";

type NavBarProps = {
  title: string;
};

export default function NavBar({ title }: NavBarProps) {
  const { isMenuOpen, toggleMenu } = useMenuState();
  const { language, toggleLanguage } = useLangState();
  const { alertState, toggleAlert } = useLogState();
  const { userProfile, loading, refreshUserProfile } = useUserProfile();
  const [langDrop, toggleDropBox] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const t = useTranslations();
  const tn = useTranslations("nav");
  const [showHSCodeWidget, setShowHSCodeWidget] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSheetOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-gray-50/5 flex flex-row justify-between items-center absolute z-20 h-[65px] left-0 right-0 top-0 border-b-[1px] border-b-gray-200 px-4 w-full backdrop-blur-md">
      <div className="flex items-center flex-row">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-[12px] bg-gray-50 border-gray-100 hover:bg-blue-100 mr-3 border-[0.5px] cursor-pointer"
              aria-label="Open menu"
            >
              <HamburgerMenu size="24" color="black" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] rounded-tr-[14px]">
            <SideBarMobile />
          </SheetContent>
        </Sheet>

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
        <div className="px-4 text-zinc-600 text-[13px]">{title}</div>
      </div>

      <div className="flex flex-row items-center">
        <Button
          className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-blue-600 border-[0.5px] border-blue-200 cursor-pointer hover:text-blue-700 bg-transparent hover:bg-blue-50 rounded-lg transition-colors duration-200 mr-4"
          onClick={() => setShowHSCodeWidget(true)}
        >
          HS Codes list
        </Button>
        {showHSCodeWidget &&
          createPortal(
            <HSCodeWidget
              open={showHSCodeWidget}
              onClose={() => setShowHSCodeWidget(false)}
            />,
            document.body
          )}
        {/* Report NTB Link */}
        <Link
          href="/client/ntb"
          className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-blue-600 border-[0.5px] border-blue-200 cursor-pointer hover:text-blue-700 bg-transparent hover:bg-blue-50 rounded-lg transition-colors duration-200 mr-4"
        >
          Report NTB
        </Link>

        <DropdownMenu open={langDrop} onOpenChange={toggleDropBox}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-row items-center justify-between h-9.5 md:w-[100px] w-[45px] px-2 gap-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 mr-5 cursor-pointer border-1 border-zinc-200 relative"
            >
              <div className="flex flex-row items-center md:w-[40px] gap-1.5">
                {language === "EN" ? (
                  <img
                    src="/icons/square.png"
                    alt="English Flag"
                    className="w-4 h-4 transition-all duration-300"
                  />
                ) : (
                  <img
                    src="/icons/tanzania.png"
                    alt="Swahili Flag"
                    className="w-4 h-4 transition-all duration-300"
                  />
                )}
                <span className="text-sm font-semibold text-gray-500 md:flex hidden">
                  {language}
                </span>
              </div>
              <ArrowDown2 size="18" color="gray" className="md:flex hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[100px]">
            <DropdownMenuItem
              onClick={() => language === "SW" && toggleLanguage()}
              className="flex flex-row items-center gap-1.5"
            >
              <img
                src="/icons/square.png"
                alt="English Flag"
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-gray-500">EN</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  language === "EN" ? "bg-blue-500" : "bg-transparent"
                }`}
              ></span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => language === "EN" && toggleLanguage()}
              className="flex flex-row items-center gap-1.5"
            >
              <img
                src="/icons/tanzania.png"
                alt="Swahili Flag"
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-gray-500">SW</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  language === "SW" ? "bg-blue-500" : "bg-transparent"
                }`}
              ></span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-[25px] max-h-[25px] bg-zinc-300 w-[1px] max-w-[1px]"></div>

        <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-center ml-2 md:ml-5 p-2"
            >
              <ProfileCircle variant="Bulk" size={30} color="#138abd" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="font-semibold text-gray-700">
                {loading ? "Loading..." : userProfile?.name || "User"}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <span>{userProfile?.role || tn("exporterManager")}</span>
                <ShieldTick size="14" color="#FF8A65" variant="Bold" />
              </div>
            </div>
            <DropdownMenuItem onClick={() => refreshUserProfile()}>
              Refresh Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={toggleAlert}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
