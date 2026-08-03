import { File, FileText, ImageIcon, FileCode } from "lucide-react";

/**
 * Format a byte count into a human-readable string (B / KB / MB / GB).
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Choose a Lucide icon component based on a MIME type string.
 */
export function FileIcon({
  mimeType,
  className,
}: {
  mimeType: string | null | undefined;
  className?: string;
}) {
  if (!mimeType) return <File className={className} aria-hidden />;
  if (mimeType.startsWith("image/"))
    return <ImageIcon className={className} aria-hidden />;
  if (mimeType === "application/pdf")
    return <FileText className={className} aria-hidden />;
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("javascript") ||
    mimeType.includes("json") ||
    mimeType.includes("xml")
  )
    return <FileCode className={className} aria-hidden />;
  return <File className={className} aria-hidden />;
}