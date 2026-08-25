import { salaryScenarioSchema } from "@/engine/schema";
import type { SalaryScenarioInput } from "@/types/tax";

const messages: Record<string, string> = {
  "personal.age": "La edad debe ser de 16 años o más.",
  "personal.children": "Introduce entre 0 y 20 hijos.",
  "personal.childrenUnder3": "Introduce entre 0 y 20 hijos menores de 3 años.",
  "personal.ascendants": "Introduce entre 0 y 10 ascendientes a cargo.",
  "job.grossAnnual": "El salario bruto anual debe ser mayor que 0 €.",
  "job.weeklyHours": "Las horas semanales deben ser mayores que 0.",
  "tax.manualIrpfRate": "El IRPF debe estar entre 0 % y 60 %.",
  "tax.reductions": "Las reducciones no pueden ser inferiores a 0 €.",
  "tax.deductions": "Las deducciones no pueden ser inferiores a 0 €.",
  "contributions.workplaceAccidentRate": "La tasa debe estar entre 0 % y 20 %."
};

export function validateScenario(scenario: unknown) {
  const result = salaryScenarioSchema.safeParse(scenario);

  if (result.success) {
    return {};
  }

  return Object.fromEntries(
    result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return [path, messages[path] ?? "El valor introducido no es válido."];
    })
  );
}