import type { SalaryScenarioInput, TaxDataset } from "@/types/tax";

export async function fetchTaxRates(): Promise<TaxDataset> {
  const response = await fetch("/api/tax-rates");
  if (!response.ok) throw new Error("No se pudieron cargar los datos fiscales");
  return response.json();
}

export async function calculateSalary(payload: { scenarioA: SalaryScenarioInput; scenarioB?: SalaryScenarioInput }) {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No se pudo calcular el salario neto");
  return response.json();
}
