"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/atoms/input";

interface InlineEditTextProps {
  value: string;
  onSave: (v: string) => void;
  isPending: boolean;
  placeholder?: string;
  className?: string;
}

export function InlineEditText({
  value,
  onSave,
  isPending,
  placeholder = "Click to edit",
  className,
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (inputValue !== value) {
      onSave(inputValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("h-8 min-h-8", className)}
        disabled={isPending}
      />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex items-center h-8 min-h-8 rounded-md px-2 -mx-2 hover:bg-muted/50 transition-colors cursor-text outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      <span className={cn("truncate", !value && "text-muted-foreground")}>
        {value || placeholder}
      </span>
      {isPending && (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground ml-2 shrink-0" />
      )}
    </div>
  );
}
