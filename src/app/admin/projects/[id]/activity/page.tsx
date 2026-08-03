"use client";

import { useParams } from "next/navigation";
import { ProjectActivityFeed } from "@/features/admin/projects/components/ProjectActivityFeed";

export default function ProjectActivityPage() {
  const { id: projectId } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Activity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          A complete timeline of all changes made to this project.
        </p>
      </div>

      <ProjectActivityFeed projectId={projectId} />
    </div>
  );
}
