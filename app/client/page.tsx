import { SidebarLeft } from "iconsax-reactjs";

export default function Dashboard() {
    return (
      <main className="flex items-center justify-center w-full h-[97vh] p-8 pb-20 sm:p-20 rounded-[14px] bg-white border-[1px] border-gray-200 shadow-sm relative">
        <nav className="flex items-center absolute h-20 left-0 right-0 top-0 border-b-[1px] border-b-gray-200 px-6">
          <SidebarLeft size="28" color="gray" />
        </nav>
        <center>Hello Welcome to TCCIA</center>
      </main>
    );
}