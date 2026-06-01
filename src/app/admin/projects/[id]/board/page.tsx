import type { Metadata } from "next";
import { KanbanBoard } from "@/components/organisms/kanban/KanbanBoard";

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
      <div>
        <h2 className="text-xl font-semibold">Board</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Drag tasks between columns to update their status.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard projectId={id} />
      </div>
    </div>
  );
}
