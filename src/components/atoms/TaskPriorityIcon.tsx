import type { ComponentType, SVGProps } from "react";
import { TaskPriority } from "@/app/generated/prisma/client";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { className?: string }
>;

interface PriorityConfig {
  icon: IconComponent;
  colorClass: string;
  label: string;
}

/**
 * Maps every TaskPriority value to a Lucide icon, a Tailwind text-color class,
 * and an accessible label string.
 *
 * Each icon is visually distinct — no two priorities share the same icon — so
 * the component conveys meaning even when rendered without the text label.
 */

const PRIORITY_CONFIG = {
  URGENT: { icon: AlertCircle, colorClass: "text-red-500", label: "Urgent" },
  HIGH: { icon: ArrowUp, colorClass: "text-orange-500", label: "High" },
  MEDIUM: { icon: ArrowRight, colorClass: "text-yellow-500", label: "Medium" },
  LOW: { icon: ArrowDown, colorClass: "text-blue-400", label: "Low" },
  NO_PRIORITY: {
    icon: Minus,
    colorClass: "text-muted-foreground",
    label: "No priority",
  },
} satisfies Record<TaskPriority | "NO_PRIORITY", PriorityConfig>;

interface TaskPriorityIconProps {
  priority: TaskPriority | null;
  showLabel?: boolean;
  className?: string;
}

/**
 * Renders the icon (and optionally the text label) for a given TaskPriority.
 *
 * Usage:
 *   <TaskPriorityIcon priority="HIGH" />
 *   <TaskPriorityIcon priority="URGENT" showLabel />
 *
 * The wrapping <span> is `aria-label`-ed so screen readers announce the
 * priority even when `showLabel` is false and only the icon is visible.
 */
export function TaskPriorityIcon({
  priority,
  showLabel = false,
  className,
}: TaskPriorityIconProps) {
  const configKey = priority ?? "NO_PRIORITY";

  const { icon: Icon, colorClass, label } = PRIORITY_CONFIG[configKey];
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={label}
      title={label}
    >
      <Icon
        className={cn("size-3.5 shrink-0", colorClass)}
        aria-hidden="true"
      />
      {showLabel && <span className={cn("text-xs", colorClass)}>{label}</span>}
    </span>
  );
}
