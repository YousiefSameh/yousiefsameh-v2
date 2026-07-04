import type { Metadata } from "next";
import { BoardClient } from "@/components/organisms/kanban/BoardClient";
import { TaskDetailDrawer } from "@/components/organisms/task-drawer/TaskDetailDrawer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Board — ${id}` };
}

export default async function ProjectBoardPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag tasks between columns to update their status.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <BoardClient projectId={id} />
        <TaskDetailDrawer projectId={id} />
      </div>
    </div>
  );
}
