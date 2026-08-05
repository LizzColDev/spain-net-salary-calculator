import dataset from "./data/current.json";
import type { RegionCode, TaxDataset } from "@/types/tax";

export function getCurrentTaxDataset(): TaxDataset {
  return dataset as TaxDataset;
}

export function getRegions() {
  return getCurrentTaxDataset().regions.map(({ code, name, fiscalRegime }) => ({ code, name, fiscalRegime }));
}

export function getRegionOrThrow(code: RegionCode, data = getCurrentTaxDataset()) {
  const region = data.regions.find((item) => item.code === code);
  if (!region) throw new Error(`Unsupported region: ${code}`);
  return region;
}
