import { TaskLabel } from "@/app/generated/prisma/client";
import { cn } from "@/lib/utils";

interface TaskLabelChipProps {
  label: Pick<TaskLabel, "name" | "color">;
  className?: string;
}

/**
 * A small pill chip that displays a task label with its associated color.
 *
 * Color is applied via inline styles, not Tailwind classes, because label
 * colors are dynamic runtime values stored in the DB (e.g. "#6366f1").
 * Tailwind's JIT scanner cannot generate arbitrary color classes at build time.
 *
 * The color is used for three visual layers:
 *   - Text: full color
 *   - Background: 13% opacity  (hex suffix "22" ≈ 0.133 alpha)
 *   - Border: 27% opacity      (hex suffix "44" ≈ 0.267 alpha)
 *
 * The hex-alpha trick requires a 6-digit hex color from the DB.
 * A CSS fallback (`currentColor`) is used for the border so the chip
 * degrades gracefully if an unexpected color format is stored.
 */
export function TaskLabelChip({ label, className }: TaskLabelChipProps) {
  const { name, color } = label;

  const hasColor = Boolean(color);

  const style = color
    ? {
        color,
        backgroundColor: `${color}22`,
        border: `1px solid ${color}44`,
      }
    : {
        color: "#8A8A93",
        backgroundColor: "#8A8A9322",
        border: "1px solid #8A8A9344",
      };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1",
        "text-[12px] font-medium leading-none whitespace-nowrap",
        !hasColor && "text-muted-foreground",
        className,
      )}
      style={style}
      title={name}
    >
      {name}
    </span>
  );
}