"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

interface InlineEditSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (v: string) => void;
  isPending: boolean;
  renderValue?: (v: string) => React.ReactNode;
  className?: string;
}

export function InlineEditSelect({
  value,
  options,
  onSave,
  isPending,
  renderValue,
  className,
}: InlineEditSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  const displayNode = renderValue ? (
    renderValue(value)
  ) : (
    <SelectValue>
      {options.find((opt) => opt.value === value)?.label ?? value}
    </SelectValue>
  );

  return (
    <div className={cn("relative flex items-center", className)}>
      <Select value={value} onValueChange={handleValueChange} disabled={isPending}>
        <SelectTrigger
          className={cn(
            "h-8 min-h-8 border-transparent bg-transparent hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 px-2 -mx-2 shadow-none min-w-[120px] transition-colors",
            isPending && "opacity-50 pointer-events-none"
          )}
        >
          {displayNode}
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="absolute right-0 size-3.5 animate-spin text-muted-foreground mr-1 pointer-events-none" />
      )}
    </div>
  );
}
