import { ClientForm } from "@/components/organisms/clients/ClientForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function EditClientPage({ params }: Params) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      avatarUrl: true,
      notes: true,
      tags: true,
      preferredContact: true,
      accessToken: true,
      accessExpiresAt: true,
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Client</h1>
        <p className="text-muted-foreground mt-1">
          Update client profile and access settings
        </p>
      </div>
      <ClientForm client={client} />
    </div>
  );
}
