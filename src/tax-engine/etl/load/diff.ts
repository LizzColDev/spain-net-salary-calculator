import type { DatasetDiff } from "../types";
import type { RegionDefinition, TaxDataset } from "@/types/tax";

function changed(label: string, before: unknown, after: unknown) {
  return JSON.stringify(before) === JSON.stringify(after) ? undefined : `${label}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`;
}

function compareRegion(before: RegionDefinition | undefined, after: RegionDefinition) {
  if (!before) return `${after.name}: nueva comunidad en dataset`;
  return changed(after.name, before.brackets, after.brackets);
}

export function compareDatasets(previous: TaxDataset | undefined, next: TaxDataset): DatasetDiff {
  if (!previous) {
    return {
      percentages: ["Dataset inicial versionado."],
      regions: next.regions.map((region) => `${region.name}: incluido`),
      bases: ["Dataset inicial versionado."],
      deductions: ["Dataset inicial versionado."],
      metadata: [`Versión inicial ${next.version}`]
    };
  }

  return {
    percentages: [
      changed("Tramos estatales IRPF", previous.stateBrackets, next.stateBrackets),
      changed("Cotizaciones trabajador", previous.contributionRates.employee, next.contributionRates.employee),
      changed("Cotizaciones empresa", previous.contributionRates.employer, next.contributionRates.employer),
      changed("Desempleo", previous.contributionRates.unemployment, next.contributionRates.unemployment),
      changed("MEI trabajador", previous.contributionRates.employee.mei, next.contributionRates.employee.mei),
      changed("MEI empresa", previous.contributionRates.employer.mei, next.contributionRates.employer.mei)
    ].filter(Boolean) as string[],
    regions: next.regions
      .map((region) => compareRegion(previous.regions.find((item) => item.code === region.code), region))
      .filter(Boolean) as string[],
    bases: [
      changed("Base máxima mensual", previous.contributionBases.monthlyMax, next.contributionBases.monthlyMax),
      changed("Bases mínimas", previous.contributionBases.monthlyMinByGroup, next.contributionBases.monthlyMinByGroup),
      changed("SMI", previous.smi, next.smi)
    ].filter(Boolean) as string[],
    deductions: [
      changed("Deducciones autonómicas", previous.regions.map((region) => [region.code, region.deductionRules]), next.regions.map((region) => [region.code, region.deductionRules])),
      changed("Límites retribución flexible", previous.flexibleCompensationExemptions, next.flexibleCompensationExemptions)
    ].filter(Boolean) as string[],
    metadata: [
      changed("Versión", previous.version, next.version),
      changed("Fecha publicación", previous.publishedAt, next.publishedAt)
    ].filter(Boolean) as string[]
  };
}
