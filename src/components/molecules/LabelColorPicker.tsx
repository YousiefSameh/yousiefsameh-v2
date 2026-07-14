"use client";

import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#64748b", // slate
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

interface LabelColorPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function LabelColorPicker({
  value,
  onChange,
  className,
}: LabelColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {PRESET_COLORS.map((color) => {
        const isSelected = value === color;
        return (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onChange(color)}
            className={cn(
              "h-5 w-5 rounded-full transition-all border border-border shadow-sm",
              isSelected
                ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                : "hover:scale-110 hover:opacity-80",
            )}
            style={{ backgroundColor: color, ...(isSelected && { "--tw-ring-color": color }) }}
            aria-label={`Select color ${color}`}
            aria-pressed={isSelected}
          />
        );
      })}
    </div>
  );
}
