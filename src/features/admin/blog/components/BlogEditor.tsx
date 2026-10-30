"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Menubar } from "@/components/molecules/rich-text-editor/Menubar";
import { Spinner } from "@/components/atoms/spinner";

interface BlogEditorProps {
  initialContent: JSONContent | null | undefined;
  onChange: (content: JSONContent) => void;
  readOnly?: boolean;
  isSaving?: boolean;
  placeholder?: string;
}

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function BlogEditor({
  initialContent,
  onChange,
  readOnly = false,
  isSaving = false,
  placeholder = "Write your blog story here...",
}: BlogEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border max-w-full h-auto my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:text-primary/80",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class: [
          "min-h-[450px] p-6 focus:outline-none",
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert",
          "!w-full !max-w-none",
        ].join(" "),
      },
    },
    immediatelyRender: false,
    editable: !readOnly,
    content: initialContent ?? EMPTY_DOC,
    onUpdate: ({ editor: e }) => {
      if (!readOnly) {
        onChangeRef.current(e.getJSON());
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
  }, [initialContent, editor]);

  return (
    <div className="relative space-y-2">
      {isSaving && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Spinner className="size-3" />
          Saving draft…
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-background dark:bg-input/20">
        {!readOnly && <Menubar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}