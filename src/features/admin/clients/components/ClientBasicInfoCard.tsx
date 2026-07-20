import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "@/features/admin/clients/validations/clients.validation";
import { FormInput } from "@/components/molecules/form-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { ImageUpload } from "@/components/molecules/upload-images/ImageUpload";

interface ClientBasicInfoCardProps {
  form: UseFormReturn<ClientFormValues>;
}

export function ClientBasicInfoCard({ form }: ClientBasicInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar */}
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  options={{ folder: "clients" }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={form.control}
            name="name"
            label="Name *"
            placeholder="John Doe"
            required
          />
          <FormInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="john@example.com"
            type="email"
          />
        </div>

        <FormInput
          control={form.control}
          name="company"
          label="Company"
          placeholder="Acme Inc."
        />
      </CardContent>
    </Card>
  );
}
