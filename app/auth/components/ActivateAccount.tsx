import Image from "next/image";

export default function ActivateAccount() {
  return (
    <div className="flex flex-col space-y-5 w-full md:w-[480px] m-2 border p-6 rounded-[15px] shadow-sm bg-gray-50 mt-15 ">
      <div className="w-full flex flex-col justify-between items-center space-y-6">
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          Account created Successfully      </div>
        <Image
          src="/icons/letter.png"
          alt="Email Icon"
          width={70}
          height={70}
        />
        <div className="text-gray-700 font-semibold text-[16px] md:text-2xl">
          Check your email
        </div>
      </div>

      <div className="text-gray-700 text-sm md:text-base text-center">
        Please check your email for login credentials. If you haven't received
        it, click the button below to resend the credentials email.
      </div>

      <div className="flex flex-row justify-between mt-4">
        <button className="border-blue-500 border-2 text-blue-500 text-sm md:text-[16px] px-4 py-2 rounded-[8px] hover:text-blue disabled:bg-gray-200 cursor-not-allowed">
          Resend email 10s
        </button>

        <button className="bg-blue-500 text-white text-sm md:text-[16px] px-4 py-2 rounded-[8px] hover:bg-blue-600 cursor-pointer" onClick={() => window.open("https://mail.google.com", "_blank")}>
          Open mailbox
        </button>
      </div>
    </div>
  );
}
