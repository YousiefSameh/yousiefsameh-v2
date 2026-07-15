"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Form } from "@/components/atoms/form";
import { Loader2 } from "lucide-react";
import {
  clientBaseSchema,
  ClientFormValues,
} from "@/features/admin/clients/validations/clients.validation";
import {
  useCreateClient,
  useUpdateClient,
} from "@/features/admin/clients/hooks";
import { toast } from "sonner";
import { ClientBasicInfoCard } from "@/features/admin/clients/components";
import { ClientCRMCard } from "@/features/admin/clients/components";
import { ClientAccessCard } from "@/features/admin/clients/components";
import { PreferredContact } from "@/app/generated/prisma/enums";

// Safe type for Client Components — no prisma/client import
export type ClientData = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  avatarUrl: string | null;
  notes: string | null;
  tags: string[];
  preferredContact: PreferredContact | null;
  accessToken: string | null;
  accessExpiresAt: Date | null;
};

interface ClientFormProps {
  client?: ClientData;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient(
    client?.id ?? "",
  );

  const isPending = isCreating || isUpdating;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientBaseSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      company: client?.company ?? "",
      avatarUrl: client?.avatarUrl ?? "",
      notes: client?.notes ?? "",
      tags: client?.tags ?? [],
      preferredContact: client?.preferredContact ?? undefined,
    },
  });

  function onSubmit(data: ClientFormValues) {
    const cleaned = {
      ...data,
      email: data.email || undefined,
      company: data.company || undefined,
      avatarUrl: data.avatarUrl || undefined,
      notes: data.notes || undefined,
    };

    if (client) {
      updateClient(cleaned, {
        onSuccess: () => {
          toast.success("Client updated successfully");
          router.push("/admin/clients");
        },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createClient(cleaned, {
        onSuccess: () => {
          toast.success("Client created successfully");
          router.push("/admin/clients");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ClientBasicInfoCard form={form} />
        <ClientCRMCard form={form} />

        {/* Access token — edit mode only */}
        {client && (
          <ClientAccessCard
            clientId={client.id}
            initialAccessToken={client.accessToken}
            initialAccessExpiresAt={
              client.accessExpiresAt?.toISOString() ?? null
            }
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : client ? (
              "Update Client"
            ) : (
              "Create Client"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
