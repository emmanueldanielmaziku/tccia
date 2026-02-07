import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://tccia.kalen.co.tz/api/membership/categories`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
