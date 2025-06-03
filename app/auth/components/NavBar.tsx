"use client";

import { useState } from "react";
import { ArrowDown2, HamburgerMenu } from "iconsax-reactjs";
import Image from "next/image";
import { useFormState } from "../services/FormStates";
import useLangState from "@/app/services/LanguageState";
import { useTranslations } from "next-intl";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { formType, toggleFormType } = useFormState();
  const { language, toggleLanguage } = useLangState();
  const [langDrop, toggleDropBox] = useState(false);
  const t = useTranslations("nav");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-14 py-3.5 text-gray-600 border-b-[0.5] border-solid border-gray-200 z-100 backdrop-blur-sm fixed t-0 shadow-md w-full">
      {/* Logo */}
      <div className="flex items-center space-x-4 gap-3">
        <Image
          src="/icons/LOGO.png"
          alt="TCCIA Logo"
          width={70}
          height={70}
          className="w-[50px] h-[50px] md:w-[70px] md:h-[70px]"
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-12">
          <li>
            <a href="/auth/login" className="hover:text-blue-500">
              {t("home")}
            </a>
          </li>
          <li>
            <a href="/auth/login" className="hover:text-blue-500">
              {t("membership")}
            </a>
          </li>
          <li>
            <a href="/auth/register" className="hover:text-blue-500">
              {t("about")}
            </a>
          </li>
          <li>
            <a href="/auth/register" className="hover:text-blue-500">
              {t("help")}
            </a>
          </li>
        </ul>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex md:flex-row items-center space-x-4">
        <button
          className="flex flex-row items-center justify-between h-11.5 w-[100px] px-2 gap-1.5 rounded-[12px] bg-gray-100 hover:bg-gray-200 mr-5 cursor-pointer border-1 border-zinc-300 relative"
          onMouseOver={() => toggleDropBox(true)}
          onMouseLeave={() => toggleDropBox(false)}
        >
          <div className="flex flex-row items-center w-[40px] gap-1.5">
            {language === "EN" ? (
              <img
                src="/icons/square.png"
                alt="English Flag"
                className="w-7 h-7"
              />
            ) : (
              <img
                src="/icons/tanzania.png"
                alt="Swahili Flag"
                className="w-7 h-7"
              />
            )}
            <span className="text-sm font-semibold text-gray-500">
              {language}
            </span>
          </div>
          <ArrowDown2 size="18" color="gray" />
          {langDrop && (
            <div className="bg-white shadow-sm w-[100px] p-1 rounded-[10px] flex flex-col absolute top-11.5 border-[0.5px] left-0 z-10">
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

        {formType === "register" ? (
          <button
            onClick={toggleFormType}
            className="text-blue-600 border-1 border-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-600 hover:text-white cursor-pointer"
          >
            {t("login")}
          </button>
        ) : (
          <button
            onClick={toggleFormType}
            className="text-blue-600 border-1 border-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-600 hover:text-white cursor-pointer font-semibold"
          >
            {t("createAccount")}
          </button>
        )}
      </div>

      {/* Burger Menu Icon */}
      <div className="md:hidden flex items-center flex-row space-x-4">
        <button
          onClick={toggleFormType}
          className="text-sm text-blue-600 border-2 border-blue-600 px-6 py-1.5 rounded-[6px] hover:tex-white hover:bg-blue-600 cursor-pointer"
        >
          {formType === "register" ? t("login") : t("createAccount")}
        </button>

        <button onClick={toggleMenu} className="text-2xl">
          {<HamburgerMenu size="32" color="black" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-100 shadow-md z-50 px-8 py-1">
          <ul className="flex flex-col items-left space-y-4 py-4 text-sm">
            <li className="border-b border-gray-300 pb-2">
              <a
                href="/auth/login"
                className="hover:text-blue-500 display-block"
              >
                {t("home")}
              </a>
            </li>
            <li className="border-b border-gray-300 pb-2">
              <a
                href="/auth/register"
                className="hover:text-blue-500 display-block"
              >
                {t("about")}
              </a>
            </li>
            <li className="border-b border-transparent pb-2">
              <a
                href="/auth/register"
                className="hover:text-blue-500 display-block"
              >
                {t("help")}
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
