"use client";

import Image from "next/image";

export default function MobileInfoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-white via-gray-100 to-gray-200 p-6">
      <div className="flex flex-col items-center mt-10">
        <Image
          src="/icons/LOGO.png"
          alt="TNCC Logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 className="text-2xl md:text-4xl font-bold text-center text-blue-700 mb-2">
          Welcome to TNCC Portal
        </h1>
        <h2 className="text-lg md:text-xl text-center text-gray-700 mb-6">
          For the best experience, please use our official mobile app.
        </h2>
        <div className="flex flex-row gap-4 mb-8">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/assets/eac_logo1.svg"
              alt="Google Play"
              width={120}
              height={40}
            />
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/assets/EAC.jpg"
              alt="App Store"
              width={120}
              height={40}
            />
          </a>
        </div>
        <div className="flex flex-row gap-6 mb-8">
          <a
            href="mailto:support@tccia.com"
            className="flex flex-col items-center text-blue-600 hover:underline"
          >
            <Image
              src="/icons/mail.png"
              alt="Email Support"
              width={40}
              height={40}
            />
            <span className="mt-1 text-sm">Email Support</span>
          </a>
          <a
            href="tel:+255123456789"
            className="flex flex-col items-center text-blue-600 hover:underline"
          >
            <Image
              src="/icons/letter.png"
              alt="Call Support"
              width={40}
              height={40}
            />
            <span className="mt-1 text-sm">Call Support</span>
          </a>
        </div>
      </div>
      <footer className="w-full flex flex-col items-center mb-2 text-xs text-gray-500">
        <div className="flex flex-row gap-2 items-center mb-1">
          <Image
            src="/icons/tanzania.png"
            alt="Tanzania"
            width={24}
            height={24}
          />
          <span>Tanzania National Chamber of Commerce</span>
        </div>
        <span>
          &copy; {new Date().getFullYear()} TNCC. All rights reserved.
        </span>
      </footer>
    </main>
  );
}
