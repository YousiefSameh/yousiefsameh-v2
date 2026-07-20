import { ProjectForm } from "@/features/admin/projects/components";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function ProjectSettingsPage({ params }: Params) {
  const { id } = await params;

  const [project, clients] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Project settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update project details, client assignment, and display settings.
        </p>
      </div>
      <ProjectForm project={project} clients={clients} />
    </div>
  );
}
