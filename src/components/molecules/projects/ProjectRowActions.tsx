import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Eye, Edit } from "lucide-react";
import { DeleteProjectButton } from "@/components/molecules/projects/DeleteProjectButton";

interface ProjectRowActionsProps {
  projectId: string;
  projectSlug: string;
}

export function ProjectRowActions({
  projectId,
  projectSlug,
}: ProjectRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="ghost" size="icon">
        <Link href={`/projects/${projectSlug}`} target="_blank">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/projects/${projectId}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <DeleteProjectButton projectId={projectId} />
    </div>
  );
}
