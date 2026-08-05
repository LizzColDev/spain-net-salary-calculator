"use client";

import * as React from "react";
import type { SalaryScenarioInput } from "@/types/tax";

const key = "salario-neto-espana:saved-scenario";

export function useLocalSimulation(defaultValue: SalaryScenarioInput) {
  const [scenario, setScenario] = React.useState(defaultValue);

  React.useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setScenario(JSON.parse(raw));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(scenario));
  }, [scenario]);

  return [scenario, setScenario] as const;
}
