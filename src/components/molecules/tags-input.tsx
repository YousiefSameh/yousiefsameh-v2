"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

export interface TagsInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ value = [], onChange, placeholder = "Add tags...", className, disabled, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine forwardRef with internal ref
    React.useImperativeHandle(ref, () => inputRef.current!);

    const addTag = (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        const newTags = [...value, trimmed];
        onChange?.(newTags);
      }
      setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
      if (disabled) return;
      const newTags = value.filter((tag) => tag !== tagToRemove);
      onChange?.(newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        e.preventDefault();
        removeTag(value[value.length - 1]);
      }
    };

    const handleBlur = () => {
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    };

    return (
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="rounded-full outline-none ring-offset-background hover:bg-muted focus:ring-1 focus:ring-ring"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Remove {tag} tag</span>
            </button>
          </Badge>
        ))}

        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="h-6 min-w-30 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    );
  }
);

TagsInput.displayName = "TagsInput";