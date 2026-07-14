"use client";

import { Project } from "@/app/generated/prisma/browser";
import { ProjectStatusBadge } from "@/components/molecules/projects/ProjectStatusBadge";
import { ProjectCategoryBadge } from "@/components/molecules/projects/ProjectCategoryBadge";
import { ProjectRowActions } from "@/components/molecules/projects/ProjectRowActions";

interface ProjectRowProps {
  project: Project;
}

export function ProjectRow({ project }: ProjectRowProps) {
  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
      <td className="p-4">
        <p className="font-medium">{project.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {project.shortDescription}
        </p>
      </td>
      <td className="p-4">
        <ProjectCategoryBadge category={project.category} />
      </td>
      <td className="p-4">
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className="p-4">
        <span
          className={
            project.isFeatured
              ? "text-green-500 font-medium"
              : "text-muted-foreground"
          }
        >
          {project.isFeatured ? "Yes" : "No"}
        </span>
      </td>
      <td className="p-4">
        <ProjectRowActions projectId={project.id} projectSlug={project.slug} />
      </td>
    </tr>
  );
}
