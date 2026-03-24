import { ClientForm } from "@/components/organisms/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <p className="text-muted-foreground mt-1">
          Create a new client profile
        </p>
      </div>
      <ClientForm />
    </div>
  );
}