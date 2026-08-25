"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: string;
  error?: string;
};

export function Field({
  label,
  value,
  type = "number",
  onChange,
  suffix,
  min,
  max,
  step = "1",
  error
}: FieldProps) {

  const id = React.useId();
  const [inputValue, setInputValue] = React.useState(String(value));

  React.useEffect(() => {
    if (inputValue !== "" && String(value) !== inputValue) {
      setInputValue(String(value));
    }
  }, [value]);

  const handleChange = (nextValue: string) => {
  setInputValue(nextValue);
  onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={inputValue}
          min={min}
          max={max}
          step={step}
          onChange={(event) => handleChange(event.target.value)}
          className={suffix ? "pr-10" : ""}
        />
        {suffix ? (
          <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}