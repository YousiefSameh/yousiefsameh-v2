"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/atoms/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/atoms/form";
import { UseFormReturn } from "react-hook-form";
import { ClientFormValues } from "@/features/admin/clients/validations/clients.validation";

const SUGGESTED_TAGS = [
  "vip",
  "high-budget",
  "slow-payer",
  "repeat-client",
  "lead",
];

interface ClientTagsInputProps {
  form: UseFormReturn<ClientFormValues>;
}

export function ClientTagsInput({ form }: ClientTagsInputProps) {
  const [input, setInput] = useState("");
  // ✅ useState للـ display — مش بيعتمد على form.watch
  const [tags, setTags] = useState<string[]>(
    () => form.getValues("tags") ?? [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function syncToForm(newTags: string[]) {
    setTags(newTags);
    form.setValue("tags", newTags, { shouldValidate: true, shouldDirty: true });
  }

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) return;
    syncToForm([...tags, trimmed]);
    setInput("");
    inputRef.current?.focus();
  }

  function removeTag(index: number) {
    syncToForm(tags.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
      return;
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addTag(val.slice(0, -1));
      return;
    }
    setInput(val);
  }

  const availableSuggestions = SUGGESTED_TAGS.filter((t) => !tags.includes(t));

  return (
    <FormField
      control={form.control}
      name="tags"
      render={() => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div className="space-y-3">
              <Input
                ref={inputRef}
                placeholder='Type a tag and press Enter or ","'
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {availableSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">
                    Suggestions:
                  </span>
                  {availableSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2.5 py-1 rounded-full text-sm border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
