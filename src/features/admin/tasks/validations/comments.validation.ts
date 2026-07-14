import z from "zod";


export const taskCommentCreateSchema = z.object({
  parentId: z.string().uuid().optional().nullable(),
  body: z.any(),
});

export type TaskCommentCreateValues = z.infer<typeof taskCommentCreateSchema>;