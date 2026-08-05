import { NextResponse } from "next/server";
import { updateTaxData } from "@/tax-engine/etl/update-tax-data";
import { jsonError, rateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limit = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) return jsonError("Demasiadas solicitudes de actualización.", 429);

  const token = request.headers.get("x-update-token");
  if (process.env.NODE_ENV === "production" && !process.env.TAX_DATA_UPDATE_TOKEN) {
    return jsonError("Actualización fiscal no configurada en producción.", 503);
  }
  if (process.env.TAX_DATA_UPDATE_TOKEN && token !== process.env.TAX_DATA_UPDATE_TOKEN) {
    return jsonError("No autorizado", 401);
  }

  const result = await updateTaxData({
    dryRun: process.env.NODE_ENV === "production",
    runTests: false
  });
  return NextResponse.json(result);
}
