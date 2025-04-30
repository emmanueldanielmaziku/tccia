"use client";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";


export default function CreatePassword(){

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    return(
        <main>
        <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New password"
          className="w-full px-6 py-4 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[12px]"
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 cursor-pointer"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
        </button>
      </div>

      <div className="relative w-full">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm password"
          className="w-full px-6 py-4 pr-12 border border-zinc-300 bg-zinc-100 outline-blue-400 rounded-[12px]"
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 cursor-pointer"
          onClick={() => setShowConfirm((state) => !state)}
        >
          {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
        </button>
      </div>
        </main>
    );
}