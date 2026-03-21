"use client";

import { Project } from "@/app/generated/prisma/browser";
import { Card, CardContent } from "@/components/atoms/card";
import { ProjectRow } from "@/components/organisms/projects/ProjectRow";
import { ProjectRowSkeleton } from "@/components/organisms/projects/ProjectRowSkeleton";
import { ProjectsEmptyState } from "@/components/molecules/projects/ProjectsEmptyState";

interface ProjectsTableProps {
  projects: Project[];
  isPending: boolean;
}

export function ProjectsTable({ projects, isPending }: ProjectsTableProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Project
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">
                  Featured
                </th>
                <th className="text-right p-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    <ProjectRowSkeleton key={i} />
                  ))
                : projects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
            </tbody>
          </table>

          {!isPending && projects.length === 0 && <ProjectsEmptyState />}
        </div>
      </CardContent>
    </Card>
  );
}
