"use client";

import { Client } from "@/app/generated/prisma/browser";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { UseFormReturn } from "react-hook-form";
import { ProjectFormValues } from "@/validations/projects.validation";

interface ClientSelectorProps {
  form: UseFormReturn<ProjectFormValues>;
  clients: Client[];
}

export function ClientSelector({ form, clients }: ClientSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="clientId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Client *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ""}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                  {client.company ? ` (${client.company})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}