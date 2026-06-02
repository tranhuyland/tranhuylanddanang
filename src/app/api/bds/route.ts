import { NextResponse } from "next/server";
import { getBdsData } from "@/lib/googleSheets";

export async function GET() {
  const data = await getBdsData();
  return NextResponse.json(data);
}