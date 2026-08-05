"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { euro, percent } from "@/lib/utils";
import type { SalaryCalculationResult } from "@/types/tax";

export function BreakdownTable({ result }: { result?: SalaryCalculationResult }) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Desglose completo</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Concepto</th>
                <th className="px-4 py-3 text-right font-medium">Importe</th>
                <th className="px-4 py-3 text-right font-medium">% bruto</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((line) => (
                <tr key={line.concept} className="border-t">
                  <td className="px-4 py-3">{line.concept}</td>
                  <td className="px-4 py-3 text-right font-medium">{euro.format(line.amount)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{percent.format(line.percentOfGross)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
