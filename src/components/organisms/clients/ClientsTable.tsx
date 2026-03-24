"use client";

import { Client } from "@/app/generated/prisma/browser";
import { Card, CardContent } from "@/components/atoms/card";
import { ClientRow } from "./ClientRow";
import { ClientRowSkeleton } from "./ClientRowSkeleton";
import { ClientsEmptyState } from "@/components/molecules/clients/ClientsEmptyState";

interface ClientsTableProps {
  clients: Client[];
  isPending: boolean;
}

export function ClientsTable({ clients, isPending }: ClientsTableProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Client
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Company
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Preferred Contact
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <ClientRowSkeleton key={i} />
                  ))
                : clients.map((client) => (
                    <ClientRow key={client.id} client={client} />
                  ))}
            </tbody>
          </table>

          {!isPending && clients.length === 0 && <ClientsEmptyState />}
        </div>
      </CardContent>
    </Card>
  );
}
