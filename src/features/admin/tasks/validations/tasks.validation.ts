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

export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  type: z.nativeEnum(TaskType),
  labelIds: z.array(z.string()),
});

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;



