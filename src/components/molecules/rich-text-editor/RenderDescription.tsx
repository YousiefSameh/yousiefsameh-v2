"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import { type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import parse from "html-react-parser";

export function RenderDescription({
  direction,
  className,
  json,
}: {
  direction?: string;
  className?: string;
  json: JSONContent;
}) {
  const output = useMemo(() => {
    return generateHTML(json, [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
  }, [json]);

  return (
    <div
      className={`prose dark:prose-invert prose-li:marker:text-primary max-w-none! w-full ${
        className || ""
      }`}
      dir={direction || "ltr"}
    >
      {parse(output)}
    </div>
  );
}