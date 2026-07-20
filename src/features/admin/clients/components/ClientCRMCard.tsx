import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
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
import { Textarea } from "@/components/atoms/textarea";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "@/features/admin/clients/validations/clients.validation";
import { PreferredContact } from "@/app/generated/prisma/enums";
import { ClientTagsInput } from "@/components/molecules/clients/ClientTagsInput";

const preferredContactLabels: Record<PreferredContact, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  PHONE: "Phone",
};

interface ClientCRMCardProps {
  form: UseFormReturn<ClientFormValues>;
}

export function ClientCRMCard({ form }: ClientCRMCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClientTagsInput form={form} />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Preferred Contact */}
          <FormField
            control={form.control}
            name="preferredContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Contact</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(preferredContactLabels).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal notes about this client..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
