"use client";

import { motion } from "framer-motion";
import { Building2, CircleDollarSign, Percent, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { euro, percent } from "@/lib/utils";
import type { SalaryCalculationResult } from "@/types/tax";

export function ResultCards({ result }: { result?: SalaryCalculationResult }) {
  const cards = [
    { label: "Neto mensual", value: result ? euro.format(result.netMonthly) : "Calculando", icon: Wallet, emphasis: true },
    { label: "Neto anual", value: result ? euro.format(result.netAnnual) : "Calculando", icon: CircleDollarSign },
    { label: "IRPF efectivo", value: result ? percent.format(result.irpfRate) : "Calculando", icon: Percent },
    { label: "Coste empresa", value: result ? euro.format(result.employerCostAnnual) : "Calculando", icon: Building2 }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
          <Card className={card.emphasis ? "border-primary bg-primary text-primary-foreground" : ""}>
            <CardContent className="flex min-h-32 flex-col justify-between p-5">
              <div className="flex items-center justify-between gap-3">
                <span className={card.emphasis ? "text-sm text-primary-foreground/75" : "text-sm text-muted-foreground"}>{card.label}</span>
                <card.icon className="h-5 w-5 opacity-70" aria-hidden="true" />
              </div>
              <strong className="text-2xl font-semibold tracking-normal">{card.value}</strong>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
