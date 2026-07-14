"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCreateComment } from "@/features/admin/tasks/comments/hooks";
import { useUpdateComment } from "@/features/admin/tasks/comments/hooks";
import { Button } from "@/components/atoms/button";
import { Loader2, Bold, Italic, Strikethrough, List, ListOrdered } from "lucide-react";
import { Toggle } from "@/components/atoms/toggle";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/react";

interface TaskCommentInputProps {
  projectId: string;
  taskId: string;
  parentId?: string | null;
  /** If provided, renders in edit-mode and calls updateComment on submit */
  commentId?: string;
  initialContent?: JSONContent;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function TaskCommentInput({
  projectId,
  taskId,
  parentId,
  commentId,
  initialContent,
  onCancel,
  onSuccess,
}: TaskCommentInputProps) {
  const { mutate: createComment, isPending: isCreating } = useCreateComment(
    projectId,
    taskId,
  );
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(
    projectId,
    taskId,
  );

  const isPending = isCreating || isUpdating;

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] p-3 focus:outline-none prose prose-sm dark:prose-invert !w-full !max-w-none text-sm",
      },
    },
    immediatelyRender: false,
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
  });

  const handleSubmit = () => {
    if (!editor) return;
    const json = editor.getJSON();
    const text = editor.getText().trim();
    if (!text) return;

    if (commentId) {
      updateComment(
        { commentId, payload: { body: json } },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    } else {
      createComment(
        { body: json, parentId: parentId ?? null },
        {
          onSuccess: () => {
            editor.commands.clearContent();
            onSuccess?.();
          },
        },
      );
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden dark:bg-input/30 focus-within:ring-1 focus-within:ring-ring transition-shadow">
      {/* Mini toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-1 bg-card">
        <Toggle
          size="sm"
          pressed={editor?.isActive("bold") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            "h-7 w-7",
            editor?.isActive("bold") && "bg-muted text-muted-foreground",
          )}
          disabled={!editor}
        >
          <Bold className="size-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("italic") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            "h-7 w-7",
            editor?.isActive("italic") && "bg-muted text-muted-foreground",
          )}
          disabled={!editor}
        >
          <Italic className="size-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("strike") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
          className={cn(
            "h-7 w-7",
            editor?.isActive("strike") && "bg-muted text-muted-foreground",
          )}
          disabled={!editor}
        >
          <Strikethrough className="size-3.5" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor?.isActive("bulletList") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-7 w-7",
            editor?.isActive("bulletList") && "bg-muted text-muted-foreground",
          )}
          disabled={!editor}
        >
          <List className="size-3.5" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("orderedList") ?? false}
          onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-7 w-7",
            editor?.isActive("orderedList") && "bg-muted text-muted-foreground",
          )}
          disabled={!editor}
        >
          <ListOrdered className="size-3.5" />
        </Toggle>
      </div>

      {/* Editor body */}
      <EditorContent editor={editor} />

      {/* Actions */}
      <div className="flex justify-end gap-2 px-3 py-2 border-t border-border bg-card/50">
        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin mr-1.5" />
          ) : null}
          {commentId ? "Save" : "Comment"}
        </Button>
      </div>
    </div>
  );
}
