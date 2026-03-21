// app/admin/projects/[id]/edit/page.tsx
import { ProjectForm } from "@/components/organisms/projects/ProjectForm";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Params) {
  const { id } = await params;

  const [project, clients] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-1">
          Update your project details
        </p>
      </div>
      <ProjectForm project={project} clients={clients} />
    </div>
  );
}