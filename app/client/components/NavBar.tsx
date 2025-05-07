'use client';
import { LanguageSquare, ShieldTick, SidebarLeft, SidebarRight, Notification } from "iconsax-reactjs";
import useMenuState from "../services/MenuState";

type NavBarProps = {
  title: string;
}

export default function NavBar({ title } : NavBarProps) { 

  const { isMenuOpen, toggleMenu } = useMenuState();

    return (
      <nav className="bg-gray-50 flex flex-row justify-between items-center absolute z-10 h-[65px] left-0 right-0 top-0 border-b-[1px] border-b-gray-200 px-3 w-full backdrop-blur-md">
        <div className="flex items-center flex-row gap-2">
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center w-12 h-12 rounded-[12px] bg-gray-50 hover:bg-gray-200 cursor-pointer"
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
          <div className="px-6 py-3">{title}</div>
        </div>

        <div className="flex flex-row items-center">
          <button className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-gray-100 hover:bg-gray-200 mr-5 cursor-pointer border-[0.5px]">
            <Notification size="22" color="gray" />
          </button>
          <div className="h-[25px] max-h-[25px] bg-zinc-300 w-[1px] max-w-[1px]"></div>
          {/* user profile */}
          <div className="flex flex-row items-center justify-center gap-2 cursor-default px-6">
            <img
              src="https://avatar.iran.liara.run/public"
              alt="User Profile"
              className="w-9 h-9"
            />
            <div className="flex flex-col items-left justify-center">
              <div className="font-semibold text-[15px] text-gray-700">
                Emmanuel Daniel Maziku
              </div>
              <div className="md:flex md:flex-row md:items-center md:gap-1 text-gray-500 text-[12px]">
                <span>Platnum Client</span>
                <ShieldTick size="14" color="#FF8A65" variant="Bold" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
}