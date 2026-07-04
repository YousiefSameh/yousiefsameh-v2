"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TaskWithMeta } from "@/features/admin/tasks/api";
import { RenderDescription } from "@/components/molecules/rich-text-editor/RenderDescription";
import { Menubar } from "@/components/molecules/rich-text-editor/Menubar";
import { useInlineTaskField } from "@/features/admin/tasks/drawer/hooks/useInlineTaskField";
import { TaskDetailTabs } from "./TaskDetailTabs";

interface TaskDetailBodyProps {
  task: TaskWithMeta;
  projectId: string;
}

export function TaskDetailBody({ task, projectId }: TaskDetailBodyProps) {
  const [isEditing, setIsEditing] = useState(false);

  const descriptionRich = useInlineTaskField(projectId, task.id, "descriptionRich");
  const description = useInlineTaskField(projectId, task.id, "description");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] p-3 focus:outline-none prose prose-sm dark:prose-invert !w-full !max-w-none",
      },
    },
    immediatelyRender: false,
    content: task.descriptionRich
      ? (task.descriptionRich as JSONContent)
      : { type: "doc", content: [{ type: "paragraph" }] },
  });

  const handleBlur = useCallback(() => {
    if (!editor) return;
    setIsEditing(false);
    const json = editor.getJSON();
    const text = editor.getText();
    descriptionRich.updateField(json);
    description.updateField(text);
  }, [editor, descriptionRich, description]);

  const isPending = descriptionRich.isPending || description.isPending;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl w-full mx-auto space-y-6">

          {/* Description */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Description
            </span>

            {isEditing ? (
              <div
                className="border border-border rounded-lg overflow-hidden dark:bg-input/30"
                onBlur={(e) => {
                  // Only blur when focus leaves the entire editor container
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    handleBlur();
                  }
                }}
              >
                <Menubar editor={editor} />
                <EditorContent editor={editor} />
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className="min-h-[80px] rounded-md px-3 py-2 -mx-3 hover:bg-muted/40 transition-colors cursor-text"
                onClick={() => setIsEditing(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsEditing(true);
                  }
                }}
              >
                {task.descriptionRich ? (
                  <RenderDescription
                    json={task.descriptionRich as JSONContent}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {isPending ? "Saving…" : "Click to add a description…"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="pt-4">
            <TaskDetailTabs task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}
