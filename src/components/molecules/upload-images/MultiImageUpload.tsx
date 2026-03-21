"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadMultipleImages,
  type UploadOptions,
  validateFile,
} from "@/lib/upload";
import Image from "next/image";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  onError?: (error: string) => void;
  options?: UploadOptions;
  className?: string;
  maxFiles?: number;
  label?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  onError,
  options,
  className,
  maxFiles = 10,
  label = "Upload Images",
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string>();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // Check max files limit
      const remainingSlots = maxFiles - value.length;
      if (acceptedFiles.length > remainingSlots) {
        const errorMsg = `Maximum ${maxFiles} images allowed. You can add ${remainingSlots} more.`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Validate all files
      for (const file of acceptedFiles) {
        const validation = validateFile(file, options);
        if (!validation.valid) {
          setError(validation.error);
          onError?.(validation.error || "Invalid file");
          return;
        }
      }

      setError(undefined);
      setUploading(true);
      setUploadingCount(acceptedFiles.length);

      try {
        const results = await uploadMultipleImages(acceptedFiles, options);

        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
          const errorMsg = `${errors.length} file(s) failed to upload`;
          setError(errorMsg);
          onError?.(errorMsg);
        }

        const successUrls = results.filter((r) => !r.error).map((r) => r.url);
        onChange([...value, ...successUrls]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setUploading(false);
        setUploadingCount(0);
      }
    },
    [value, onChange, onError, options, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxFiles,
    disabled: uploading || value.length >= maxFiles,
  });

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label} ({value.length}/{maxFiles})
        </label>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={url}
                alt={`Gallery ${index + 1}`}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-secondary/50",
            "aspect-video flex items-center justify-center",
            isDragActive && "border-primary bg-primary/5",
            uploading && "opacity-50 cursor-not-allowed",
            error && "border-destructive"
          )}
        >
          <input {...getInputProps()} />

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}
                ...
              </p>
            </div>
          )}

          <div className="text-center p-6">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-3">
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <Plus className="h-12 w-12" />
              )}
            </div>
            <div className="space-y-1">
              {isDragActive ? (
                <p className="text-sm font-medium">Drop the images here</p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, GIF up to 5MB each
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}