import z from "zod";

export const taskAttachmentCreateSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  url: z.string().url("Must be a valid URL"),
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().optional().nullable(),
  sizeBytes: z.number().int().positive().optional().nullable(),
});

export type TaskAttachmentCreateValues = z.infer<
  typeof taskAttachmentCreateSchema
>;