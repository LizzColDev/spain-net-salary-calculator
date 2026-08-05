"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Copy, Download, FileSpreadsheet, Link, Moon, Plus, Save, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { BreakdownTable } from "./breakdown-table";
import { defaultScenario } from "./default-scenario";
import { ResultCards } from "./result-cards";
import { calculateSalary, fetchTaxRates } from "@/lib/api";
import { euro, euroPrecise } from "@/lib/utils";
import { useLocalSimulation } from "@/hooks/use-local-simulation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { trackEvent } from "@/lib/analytics";
import { captureException } from "@/lib/monitoring";
import type { SalaryCalculationResult, SalaryScenarioInput } from "@/types/tax";

const SalaryCharts = dynamic(() => import("./salary-charts").then((mod) => mod.SalaryCharts), {
  ssr: false,
  loading: () => <div className="h-72 rounded-lg border bg-card shadow-soft" aria-label="Cargando gráficos" />
});

type ResultPayload = {
  scenarioA: SalaryCalculationResult;
  scenarioB?: SalaryCalculationResult;
  difference?: { netAnnual: number; netMonthly: number; employerCostAnnual: number; irpf: number };
  dataset: { version: string; taxYear: number; publishedAt: string };
};

const boolOptions = [
  { label: "No", value: "false" },
  { label: "Sí", value: "true" }
];

function toBool(value: string) {
  return value === "true";
}

function numberValue(value: string, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function updateAtPath<T>(object: T, path: string, value: unknown): T {
  const clone = structuredClone(object);
  const keys = path.split(".");
  let cursor: Record<string, unknown> = clone as Record<string, unknown>;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key] as Record<string, unknown>;
  });
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

function Field({
  label,
  value,
  type = "number",
  onChange,
  suffix,
  min,
  max,
  step = "1"
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: string;
}) {
  const id = React.useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={type} value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} className={suffix ? "pr-10" : ""} />
        {suffix ? <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function BoolSelect({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={String(value)} onValueChange={(next) => onChange(toBool(next))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {boolOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ScenarioEditor({
  title,
  scenario,
  onChange,
  compact = false
}: {
  title: string;
  scenario: SalaryScenarioInput;
  onChange: (scenario: SalaryScenarioInput) => void;
  compact?: boolean;
}) {
  const { data } = useQuery({ queryKey: ["tax-rates"], queryFn: fetchTaxRates });
  const set = React.useCallback((path: string, value: unknown) => onChange(updateAtPath(scenario, path, value)), [onChange, scenario]);
  const updateComp = (id: string, amount: number) => {
    onChange({
      ...scenario,
      compensation: scenario.compensation.map((item) => item.id === id ? { ...item, annualAmount: amount } : item)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Todos los supuestos son modificables y se recalculan en tiempo real.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Salario bruto anual" value={scenario.job.grossAnnual} suffix="€" step="100" onChange={(v) => set("job.grossAnnual", numberValue(v))} />
          <Field label="Pagas" value={scenario.job.payments} min={1} max={24} onChange={(v) => set("job.payments", numberValue(v, 12))} />
          <div className="space-y-2">
            <Label>Comunidad autónoma</Label>
            <Select value={scenario.job.region} onValueChange={(v) => set("job.region", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {data?.regions.map((region) => <SelectItem key={region.code} value={region.code}>{region.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contrato</Label>
            <Select value={scenario.job.contractType} onValueChange={(v) => set("job.contractType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="indefinite">Indefinido</SelectItem>
                <SelectItem value="temporary">Temporal</SelectItem>
                <SelectItem value="training">Formación</SelectItem>
                <SelectItem value="internship">Prácticas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Horas semanales" value={scenario.job.weeklyHours} min={1} max={80} onChange={(v) => set("job.weeklyHours", numberValue(v, 40))} />
          <Field label="Grupo cotización" value={scenario.job.contributionGroup} type="text" onChange={(v) => set("job.contributionGroup", v)} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label>Jornada</Label>
            <span className="text-sm text-muted-foreground">{Math.round(scenario.job.workingTimeRatio * 100)}%</span>
          </div>
          <Slider min={0.1} max={1} step={0.05} value={[scenario.job.workingTimeRatio]} onValueChange={([value]) => set("job.workingTimeRatio", value)} />
        </section>

        {!compact ? (
          <>
            <Separator />
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Edad" value={scenario.personal.age} min={16} max={100} onChange={(v) => set("personal.age", numberValue(v, 35))} />
              <Field label="Hijos" value={scenario.personal.children} min={0} max={20} onChange={(v) => set("personal.children", numberValue(v))} />
              <Field label="Hijos menores de 3" value={scenario.personal.childrenUnder3} min={0} max={20} onChange={(v) => set("personal.childrenUnder3", numberValue(v))} />
              <Field label="Ascendientes a cargo" value={scenario.personal.ascendants} min={0} max={10} onChange={(v) => set("personal.ascendants", numberValue(v))} />
              <BoolSelect label="Familia numerosa" value={scenario.personal.familyLarge} onChange={(v) => set("personal.familyLarge", v)} />
              <BoolSelect label="Monoparental" value={scenario.personal.singleParent} onChange={(v) => set("personal.singleParent", v)} />
              <BoolSelect label="Movilidad geográfica" value={scenario.personal.mobilityGeographic} onChange={(v) => set("personal.mobilityGeographic", v)} />
              <div className="space-y-2">
                <Label>Discapacidad trabajador</Label>
                <Select value={scenario.personal.disability} onValueChange={(v) => set("personal.disability", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No</SelectItem>
                    <SelectItem value="gte33">33% o superior</SelectItem>
                    <SelectItem value="gte65">65% o superior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <Separator />
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>IRPF</Label>
                <Select value={scenario.tax.mode} onValueChange={(v) => set("tax.mode", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automático</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="IRPF manual" value={Math.round(scenario.tax.manualIrpfRate * 1000) / 10} suffix="%" step="0.1" onChange={(v) => set("tax.manualIrpfRate", numberValue(v) / 100)} />
              <Field label="Mínimo personal override" value={scenario.tax.personalMinimumOverride ?? ""} suffix="€" step="100" onChange={(v) => set("tax.personalMinimumOverride", v === "" ? undefined : numberValue(v))} />
              <Field label="Reducciones" value={scenario.tax.reductions} suffix="€" step="100" onChange={(v) => set("tax.reductions", numberValue(v))} />
              <Field label="Deducciones" value={scenario.tax.deductions} suffix="€" step="100" onChange={(v) => set("tax.deductions", numberValue(v))} />
              <Field label="Accidentes trabajo empresa" value={Math.round(scenario.contributions.workplaceAccidentRate * 1000) / 10} suffix="%" step="0.1" onChange={(v) => set("contributions.workplaceAccidentRate", numberValue(v) / 100)} />
            </section>

            <Separator />
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Bonus anual" value={scenario.bonus.annualBonus} suffix="€" step="100" onChange={(v) => set("bonus.annualBonus", numberValue(v))} />
              <Field label="Variable" value={scenario.bonus.variable} suffix="€" step="100" onChange={(v) => set("bonus.variable", numberValue(v))} />
              <Field label="RSU" value={scenario.bonus.rsu} suffix="€" step="100" onChange={(v) => set("bonus.rsu", numberValue(v))} />
              <Field label="Comisiones" value={scenario.bonus.commissions} suffix="€" step="100" onChange={(v) => set("bonus.commissions", numberValue(v))} />
              {scenario.compensation.map((item) => (
                <Field key={item.id} label={item.label} value={item.annualAmount} suffix="€" step="100" onChange={(v) => updateComp(item.id, numberValue(v))} />
              ))}
            </section>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function CalculatorForm() {
  const { theme, setTheme } = useTheme();
  const [scenarioA, setScenarioA] = useLocalSimulation(defaultScenario);
  const [scenarioB, setScenarioB] = React.useState<SalaryScenarioInput>({ ...defaultScenario, job: { ...defaultScenario.job, grossAnnual: 52000, region: "CT" } });
  const [compare, setCompare] = React.useState(false);
  const debouncedScenarioA = useDebouncedValue(scenarioA, 180);
  const debouncedScenarioB = useDebouncedValue(scenarioB, 180);

  const query = useQuery<ResultPayload>({
    queryKey: ["calculate", debouncedScenarioA, debouncedScenarioB, compare],
    queryFn: () => calculateSalary({ scenarioA: debouncedScenarioA, scenarioB: compare ? debouncedScenarioB : undefined }),
    staleTime: 5_000
  });

  React.useEffect(() => {
    if (query.error) captureException(query.error, { feature: "salary-calculation" });
  }, [query.error]);

  React.useEffect(() => {
    if (query.data?.scenarioA) {
      trackEvent({
        name: "calculation_completed",
        properties: {
          grossAnnual: query.data.scenarioA.grossAnnual,
          netAnnual: query.data.scenarioA.netAnnual
        }
      });
    }
  }, [query.data?.scenarioA]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("s");
    if (!shared) return;
    try {
      setScenarioA(JSON.parse(atob(shared)));
    } catch {
      // Ignore malformed shared URLs; the default scenario remains usable.
    }
  }, [setScenarioA]);

  const copy = async () => {
    if (!query.data?.scenarioA) return;
    await navigator.clipboard.writeText(`Neto mensual: ${euroPrecise.format(query.data.scenarioA.netMonthly)}\nNeto anual: ${euroPrecise.format(query.data.scenarioA.netAnnual)}\nCoste empresa: ${euroPrecise.format(query.data.scenarioA.employerCostAnnual)}`);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ scenarioA, scenarioB, result: query.data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "simulacion-salario-neto.json";
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent({ name: "export_triggered", properties: { format: "json" } });
  };

  const exportExcel = () => {
    if (!query.data?.scenarioA) return;
    const rows = [
      ["Concepto", "Importe", "% bruto"],
      ...query.data.scenarioA.lines.map((line) => [line.concept, String(Math.round(line.amount * 100) / 100), String(Math.round(line.percentOfGross * 10000) / 100)])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "salario-neto-excel.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent({ name: "export_triggered", properties: { format: "csv" } });
  };

  const shareUrl = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", btoa(JSON.stringify(scenarioA)));
    await navigator.clipboard.writeText(url.toString());
    trackEvent({ name: "simulation_shared" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Motor fiscal modular · España {query.data?.dataset.taxYear ?? "2026"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">Calculadora de salario neto</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">Simula IRPF, cotizaciones, retribución flexible, bonus, coste empresa y escenarios comparados con datos legales externos al motor.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Cambiar tema">
            <Sun className="h-4 w-4 dark:hidden" /><Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button variant="outline" onClick={copy} disabled={!query.data?.scenarioA}><Copy className="h-4 w-4" />Copiar</Button>
          <Button variant="outline" onClick={shareUrl}><Link className="h-4 w-4" />Compartir</Button>
          <Button variant="outline" onClick={exportJson} disabled={!query.data?.scenarioA}><Download className="h-4 w-4" />Exportar JSON</Button>
          <Button onClick={() => setCompare((value) => !value)}><Plus className="h-4 w-4" />Comparar</Button>
        </div>
      </div>

      {query.isError ? (
        <Card role="alert" className="border-destructive/40">
          <CardContent className="p-5 text-sm text-destructive">
            No se ha podido calcular el salario con los datos actuales. Revisa los campos o vuelve a intentarlo.
          </CardContent>
        </Card>
      ) : null}

      <div aria-live="polite">
        <ResultCards result={query.data?.scenarioA} />
      </div>

      {compare && query.data?.difference ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Comparador A vs B</CardTitle>
              <CardDescription>Diferencias calculadas al cambiar salario, comunidad, contrato o cualquier parámetro.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              <div><p className="text-sm text-muted-foreground">Neto anual</p><strong>{euro.format(query.data.difference.netAnnual)}</strong></div>
              <div><p className="text-sm text-muted-foreground">Neto mensual</p><strong>{euro.format(query.data.difference.netMonthly)}</strong></div>
              <div><p className="text-sm text-muted-foreground">Coste empresa</p><strong>{euro.format(query.data.difference.employerCostAnnual)}</strong></div>
              <div><p className="text-sm text-muted-foreground">IRPF</p><strong>{euro.format(query.data.difference.irpf)}</strong></div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-6">
          <ScenarioEditor title="Escenario A" scenario={scenarioA} onChange={setScenarioA} />
          {compare ? <ScenarioEditor title="Escenario B" scenario={scenarioB} onChange={setScenarioB} compact /> : null}
        </div>
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Simulador rápido</CardTitle>
              <CardDescription>Arrastra para ver el neto en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span>Bruto</span><strong>{euro.format(scenarioA.job.grossAnnual)}</strong></div>
              <Slider min={12000} max={200000} step={1000} value={[scenarioA.job.grossAnnual]} onValueChange={([value]) => setScenarioA(updateAtPath(scenarioA, "job.grossAnnual", value))} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3"><span className="text-muted-foreground">IRPF</span><strong className="block">{query.data ? euro.format(query.data.scenarioA.irpf) : "..."}</strong></div>
                <div className="rounded-md border p-3"><span className="text-muted-foreground">Cotizaciones</span><strong className="block">{query.data ? euro.format(query.data.scenarioA.employeeContributions) : "..."}</strong></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Legislación</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Dataset: <strong className="text-foreground">{query.data?.dataset.version ?? "cargando"}</strong></p>
              <p>Publicado: {query.data?.dataset.publishedAt ?? "cargando"}</p>
              <p>Los valores legales se cargan desde configuración externa y pueden actualizarse mediante ETL.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <SalaryCharts result={query.data?.scenarioA} />
      <BreakdownTable result={query.data?.scenarioA} />

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Exporta el desglose para Excel, imprime o guarda como PDF y comparte la simulación mediante una URL copiada al portapapeles.</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportExcel} disabled={!query.data?.scenarioA}><FileSpreadsheet className="h-4 w-4" />Excel</Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!query.data?.scenarioA}><Save className="h-4 w-4" />PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
