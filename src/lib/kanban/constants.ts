import { TaskStatus } from "@/app/generated/prisma/client";

export const KANBAN_COLUMN_ORDER: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

export const KANBAN_COLUMN_LABELS: Record<TaskStatus, string> = {
  BACKLOG:     "Backlog",
  TODO:        "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW:      "Review",
  DONE:        "Done",
};

export const KANBAN_COLUMN_COLORS: Record<TaskStatus, string> = {
  BACKLOG:     "bg-slate-400",
  TODO:        "bg-blue-400",
  IN_PROGRESS: "bg-amber-400",
  REVIEW:      "bg-violet-400",
  DONE:        "bg-emerald-400",
};