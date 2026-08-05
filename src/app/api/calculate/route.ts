import { NextResponse } from "next/server";
import { calculateRequestSchema } from "@/engine/schema";
import { calculateNetSalary } from "@/engine";
import { getCurrentTaxDataset } from "@/tax-engine/repository";
import { jsonError, rateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limit = rateLimit(request, { limit: 120, windowMs: 60_000 });
  if (!limit.allowed) return jsonError("Demasiadas solicitudes. Inténtalo de nuevo en un minuto.", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("JSON inválido.", 400);
  }
  const parsed = calculateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Datos de cálculo inválidos", 400, parsed.error.flatten());
  }

  const data = getCurrentTaxDataset();
  const scenarioA = calculateNetSalary(parsed.data.scenarioA, data);
  const scenarioB = parsed.data.scenarioB ? calculateNetSalary(parsed.data.scenarioB, data) : undefined;

  return NextResponse.json({
    scenarioA,
    scenarioB,
    difference: scenarioB
      ? {
          netAnnual: scenarioB.netAnnual - scenarioA.netAnnual,
          netMonthly: scenarioB.netMonthly - scenarioA.netMonthly,
          employerCostAnnual: scenarioB.employerCostAnnual - scenarioA.employerCostAnnual,
          irpf: scenarioB.irpf - scenarioA.irpf
        }
      : undefined,
    dataset: {
      version: data.version,
      taxYear: data.taxYear,
      publishedAt: data.publishedAt,
      sources: data.sources
    }
  });
}
