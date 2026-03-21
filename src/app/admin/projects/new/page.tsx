import { ProjectForm } from "@/components/organisms/projects/ProjectForm";
import prisma from "@/lib/prisma";

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Project</h1>
        <p className="text-muted-foreground mt-1">
          Create a new portfolio project
        </p>
      </div>
      <ProjectForm clients={clients} />
    </div>
  );
}
