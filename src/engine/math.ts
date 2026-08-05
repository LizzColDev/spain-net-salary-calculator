import type { TaxBracket } from "@/types/tax";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function applyProgressiveBrackets(base: number, brackets: TaxBracket[]) {
  const rows = brackets.map((bracket) => {
    const upper = bracket.to ?? Number.POSITIVE_INFINITY;
    const taxable = Math.max(0, Math.min(base, upper) - bracket.from);
    const amount = taxable * bracket.rate;
    return { ...bracket, taxable, amount };
  });

  return {
    tax: sum(rows.map((row) => row.amount)),
    rows
  };
}

export function percentOf(amount: number, base: number) {
  if (base <= 0) return 0;
  return amount / base;
}
