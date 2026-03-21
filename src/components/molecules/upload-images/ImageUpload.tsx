"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, type UploadOptions, validateFile } from "@/lib/upload";
import { Button } from "@/components/atoms/button";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  options?: UploadOptions;
  className?: string;
  preview?: boolean;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  onError,
  options,
  className,
  preview = true,
  label = "Upload Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [error, setError] = useState<string>();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file
      const validation = validateFile(file, options);
      if (!validation.valid) {
        setError(validation.error);
        onError?.(validation.error || "Invalid file");
        return;
      }

      setError(undefined);
      setUploading(true);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      try {
        const result = await uploadImage(file, options);

        if (result.error) {
          setError(result.error);
          onError?.(result.error);
          setPreviewUrl(value);
        } else {
          onChange(result.url);
          setPreviewUrl(result.url);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setError(errorMsg);
        onError?.(errorMsg);
        setPreviewUrl(value);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [value, onChange, onError, options]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(undefined);
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-secondary/50",
          isDragActive && "border-primary bg-primary/5",
          uploading && "opacity-50 cursor-not-allowed",
          !previewUrl && "aspect-video flex items-center justify-center",
          error && "border-destructive"
        )}
      >
        <input {...getInputProps()} />

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {previewUrl && preview ? (
          <div className="relative group">
            <Image
              src={previewUrl}
              alt="Preview"
              width={700}
              height={700}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-3">
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <Upload className="h-12 w-12" />
              )}
            </div>
            <div className="space-y-1">
              {isDragActive ? (
                <p className="text-sm font-medium">Drop the image here</p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Drag & drop an image here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}