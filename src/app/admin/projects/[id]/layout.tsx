import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProjectWorkspaceNav } from "@/components/molecules/projects/ProjectWorkspaceNav";
import { Button } from "@/components/atoms/button";
import { ChevronLeft } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params["params"];
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, title: true, status: true },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href="/admin/projects">
              <ChevronLeft className="h-4 w-4" />
              All projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-1 capitalize">
              {String(project.status).replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <ProjectWorkspaceNav projectId={id} />

      <div>{children}</div>
    </div>
  );
}
