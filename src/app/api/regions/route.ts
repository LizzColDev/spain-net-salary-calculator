import { NextResponse } from "next/server";
import { getRegions } from "@/tax-engine/repository";

export async function GET() {
  return NextResponse.json({ regions: getRegions() });
}
