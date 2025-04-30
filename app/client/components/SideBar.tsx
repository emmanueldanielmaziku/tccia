import { ArchiveBook, Direct, Element3, Profile2User } from "iconsax-reactjs";

export default function SideBar() {
  return (
    <div className="bg-gray-100 w-72 h-full p-6">
      <div className="flex flex-row justify-start items-center gap-4">
        <img src="/icons/LOGO.png" alt="Logo" className="w-15 h-15" />
        <div>
          <h1 className="font-bold text-xl text-gray-700">TCCIA'S CLIENT</h1>
          <div className="text-gray-500">Dashboard</div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-sm text-gray-500 mt-8">Modules</h2>
        <ul className="mt-4">
          <li className="cursor-pointer md:flex md:flex-row md:items-center md:gap-2 hover:bg-gray-200 border-b-[0.5px] border-gray-300 py-5">
            <Element3 size="22" color="#474747" />
            <span className="text-gray-700">Dashboard</span>
          </li>
          <li className="cursor-pointer md:flex md:flex-row md:items-center md:gap-2 hover:bg-gray-200 border-b-[0.5px] border-gray-300 py-5">
            <ArchiveBook size="22" color="#474747" />
            <span className="text-gray-700">Certificate of Origin</span>
          </li>
          <li className="cursor-pointer md:flex md:flex-row md:items-center md:gap-2 hover:bg-gray-200 border-b-[0.5px] border-gray-300 py-5">
            <Profile2User size="22" color="#474747" />
            <span className="text-gray-700">Membership</span>
          </li>
          <li className="cursor-pointer md:flex md:flex-row md:items-center md:gap-2 hover:bg-gray-200 border-b-[0.5px] border-gray-300 py-5">
            <Direct size="22" color="#474747" />
            <span className="text-gray-700">Non-Tarrif Barrier</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
