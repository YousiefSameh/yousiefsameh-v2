import z from "zod";

export const taskSubtaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
});

export type TaskSubtaskCreateValues = z.infer<typeof taskSubtaskCreateSchema>;