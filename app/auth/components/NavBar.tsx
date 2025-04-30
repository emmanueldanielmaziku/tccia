"use client";

import { useState } from "react";
import { HamburgerMenu } from "iconsax-reactjs";
import Image from "next/image";
import { useFormState } from "../services/FormStates";


export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { formType, toggleFormType } = useFormState();

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
              Home
            </a>
          </li>
          <li>
            <a href="/auth/register" className="hover:text-blue-500">
              About Us
            </a>
          </li>
          <li>
            <a href="/auth/register" className="hover:text-blue-500">
              Help
            </a>
          </li>
        </ul>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center space-x-4">
        {formType === "register" ? (
          <button
            onClick={toggleFormType}
            className="text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-600 hover:text-white cursor-pointer"
          >
            Login
          </button>
        ) : (
          <button
            onClick={toggleFormType}
            className="text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-[10px] hover:bg-blue-600 hover:text-white cursor-pointer"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Burger Menu Icon */}
      <div className="md:hidden flex items-center flex-row space-x-4">
        <button
          onClick={toggleFormType}
          className="text-sm text-blue-600 border-2 border-blue-600 px-6 py-1.5 rounded-[6px] hover:tex-white hover:bg-blue-600 cursor-pointer"
        >
          {formType === "register" ? "Login" : "Create Account"}
        </button>

        <button onClick={toggleMenu} className="text-2xl">
          {
            
            <HamburgerMenu size="32" color="black" />
          }
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
                Home
              </a>
            </li>
            <li className="border-b border-gray-300 pb-2">
              <a
                href="/auth/register"
                className="hover:text-blue-500 display-block"
              >
                About Us
              </a>
            </li>
            <li className="border-b border-transparent pb-2">
              <a
                href="/auth/register"
                className="hover:text-blue-500 display-block"
              >
                Help
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
