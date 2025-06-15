"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/auth");
  }

  return token.value;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return !!token;
}

export async function logout() {
  // Clear all local storage items
  if (typeof window !== "undefined") {
    localStorage.clear();
  }

  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/auth");
}
