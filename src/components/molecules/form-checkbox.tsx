"use client"

import * as React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/atoms/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../atoms/form";

export interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends React.ComponentProps<typeof Checkbox> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
}

export const FormCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  ...props
}: FormCheckboxProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
