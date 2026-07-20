import z from "zod";

export const labelBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #6366f1)")
    .optional()
    .nullable(),
});

export type LabelFormValues = z.infer<typeof labelBaseSchema>;