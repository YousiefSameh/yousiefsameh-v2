import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { FolderOpen, Plus } from "lucide-react";

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
      <div>
        <p className="font-medium">No projects yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first project to get started.
        </p>
      </div>
      <Button asChild size="lg" className="mt-2">
        <Link href="/admin/projects/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Link>
      </Button>
    </div>
  );
}