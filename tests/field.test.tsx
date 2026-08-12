import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../src/components/calculator/field";

describe("Field", () => {
  it("preserves an empty value when the user clears the input", () => {
    const onChange = vi.fn();

    render(
      <Field
        label="Salario bruto anual"
        value={35000}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText("Salario bruto anual");

    fireEvent.change(input, { target: { value: "" } });

    expect((input as HTMLInputElement).value).toBe("");
  });

  it("updates the value when the user types after clearing the input", () => {
  const onChange = vi.fn();

  render(
    <Field
      label="Salario bruto anual"
      value={35000}
      onChange={onChange}
    />
  );

  const input = screen.getByLabelText("Salario bruto anual");

  fireEvent.change(input, { target: { value: "" } });
  fireEvent.change(input, { target: { value: "42000" } });

  expect(onChange).toHaveBeenCalledWith("42000");
  });

});