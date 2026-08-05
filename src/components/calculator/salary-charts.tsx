"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { euro } from "@/lib/utils";
import type { SalaryCalculationResult } from "@/types/tax";

const colors = ["#0f766e", "#2563eb", "#b45309", "#64748b"];

export function SalaryCharts({ result }: { result?: SalaryCalculationResult }) {
  if (!result) return null;

  const distribution = [
    { name: "Neto", value: result.netAnnual },
    { name: "IRPF", value: result.irpf },
    { name: "Cotizaciones", value: result.employeeContributions },
    { name: "Empresa", value: result.employerContributions }
  ];
  const bars = [
    { name: "Bruto", value: result.grossAnnual },
    { name: "Neto", value: result.netAnnual },
    { name: "Coste", value: result.employerCostAnnual }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Distribución salarial</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
                {distribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => euro.format(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Bruto, neto y coste empresa</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => euro.format(Number(value))} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
