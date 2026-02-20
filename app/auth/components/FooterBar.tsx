"use client";

export default function FooterBar() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="flex flex-row w-full space-x-4 items-center justify-center px-14 py-6 text-gray-500 border-t-[0.5] border-solid border-gray-200 fixed bottom-0 backdrop-blur-sm z-50">
      <div className="text-sm hover:text-blue-500">
        © {currentYear} TNCC. All rights reserved.
      </div>
    </footer>
  );
}