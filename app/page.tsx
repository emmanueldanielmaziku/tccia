"use client";
import FooterBar from "./auth/components/FooterBar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-between w-full max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center relative">
          <img
            src="/icons/LOGO.png"
            alt="TCCIA Logo"
            width={90}
            height={90}
            className="object-contain md:h-[150px] md:w-[150px]"
          />

          <div className="w-[100px] h-[100px] md:w-[180px] md:h-[180px] border-2 border-blue-500 border-t-transparent rounded-full animate-spin absolute"></div>
        </div>

        <FooterBar />
      </div>
    </main>
  );
}
