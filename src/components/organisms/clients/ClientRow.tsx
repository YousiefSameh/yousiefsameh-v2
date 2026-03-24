"use client";

import { Client } from "@/app/generated/prisma/browser";
import { PreferredContactBadge } from "./PreferredContactBadge";
import { ClientRowActions } from "@/components/molecules/clients/ClientRowActions";

interface ClientRowProps {
  client: Client;
}

export function ClientRow({ client }: ClientRowProps) {
  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
      <td className="p-4">
        <p className="font-medium">{client.name}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {client.email}
        </p>
      </td>
      <td className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-1">
          {client.company}
        </p>
      </td>
      <td className="p-4">
        <PreferredContactBadge preferredContact={client.preferredContact} />
      </td>
      <td className="p-4">
        <ClientRowActions
          clientId={client.id}
          clientAccessToken={client.accessToken}
        />
      </td>
    </tr>
  );
}
