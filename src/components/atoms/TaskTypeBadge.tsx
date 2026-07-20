import { TaskType } from "@/app/generated/prisma/client";
import { Sparkles, Bug, Wrench, RefreshCw, Users, Circle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskTypeBadgeProps {
  type: TaskType;
  size?: "sm" | "md";
  className?: string;
}

const TYPE_CONFIG: Record<TaskType, { icon: LucideIcon; label: string }> = {
  FEATURE: { icon: Sparkles, label: "Feature" },
  BUG: { icon: Bug, label: "Bug" },
  CHORE: { icon: Wrench, label: "Chore" },
  REFACTOR: { icon: RefreshCw, label: "Refactor" },
  MEETING: { icon: Users, label: "Meeting" },
  OTHER: { icon: Circle, label: "Other" },
};

export function TaskTypeBadge({
  type,
  size = "sm",
  className,
}: TaskTypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
      title={config.label}
    >
      <Icon
        className={cn("mr-1.5", size === "sm" ? "size-3" : "size-3.5")}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
