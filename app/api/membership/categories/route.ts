import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://staff.tncc.or.tz/api/membership/categories`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
