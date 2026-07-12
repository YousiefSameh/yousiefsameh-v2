import {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/app/generated/prisma/enums";
import z from "zod";

export const taskBaseSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional().or(z.literal("")),
  descriptionRich: z.any().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  type: z.nativeEnum(TaskType).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  isClientVisible: z.boolean().optional(),
  labelIds: z.array(z.string().uuid()).optional().default([]),
});

export type TaskFormValues = z.infer<typeof taskBaseSchema>;

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  type: z.nativeEnum(TaskType).optional(),
  assigneeId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  search: z.string().min(1).optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;

export const taskMoveSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  orderedTaskIds: z.array(z.string().uuid()).min(1),
});

export type TaskMovePayload = z.infer<typeof taskMoveSchema>;

export const taskCommentCreateSchema = z.object({
  parentId: z.string().uuid().optional().nullable(),
  body: z.any(),
});

export type TaskCommentCreateValues = z.infer<typeof taskCommentCreateSchema>;

export const taskCommentUpdateSchema = z.object({
  body: z.any(),
});

export type TaskCommentUpdateValues = z.infer<typeof taskCommentUpdateSchema>;

export const taskLabelSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  color: z.string().optional().nullable(),
});

export type TaskLabelValues = z.infer<typeof taskLabelSchema>;

export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  labelIds: z.array(z.string()),
});

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

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
