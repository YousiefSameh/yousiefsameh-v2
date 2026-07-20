"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Menubar } from "@/components/molecules/rich-text-editor/Menubar";
import { Spinner } from "@/components/atoms/spinner";

interface ReportEditorProps {
  initialContent: JSONContent | null | undefined;
  onSave: (content: JSONContent) => void;
  readOnly?: boolean;
  isSaving?: boolean;
}

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function ReportEditor({
  initialContent,
  onSave,
  readOnly = false,
  isSaving = false,
}: ReportEditorProps) {
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class: [
          "min-h-[500px] p-6 focus:outline-none",
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert",
          "!w-full !max-w-none",
        ].join(" "),
      },
    },
    immediatelyRender: false,
    editable: !readOnly,
    content: initialContent ?? EMPTY_DOC,
    onBlur: ({ editor: e }) => {
      if (!readOnly) {
        onSaveRef.current(e.getJSON());
      }
    },
  });

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const incoming = initialContent ?? EMPTY_DOC;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  return (
    <div className="relative">
      {readOnly && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <span className="font-medium">Published</span>
          <span className="text-amber-600 dark:text-amber-400">
            — Unpublish the report to make edits.
          </span>
        </div>
      )}

      {isSaving && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 text-xs text-muted-foreground z-10">
          <Spinner className="size-3" />
          Saving…
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden dark:bg-input/30">
        {!readOnly && <Menubar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}