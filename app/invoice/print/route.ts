import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), "lib/Invoice/index.html");
    const html = fs.readFileSync(filePath, "utf8");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error serving invoice template:", error);
    return new NextResponse("Invoice template not found", { status: 404 });
  }
}
