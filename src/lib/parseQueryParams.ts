import { z } from "zod";
import { ProjectCategory, ProjectStatus, ProjectType } from "@/app/generated/prisma/enums";

export const projectQuerySchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(10),
  featured: z.enum(["true", "false"]).transform(v => v === "true").optional(),
  category: z.nativeEnum(ProjectCategory).optional(),
  status:   z.nativeEnum(ProjectStatus).optional(),
  type:     z.nativeEnum(ProjectType).optional(),
  clientId: z.string().uuid().optional(),
  search:   z.string().optional(),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;

export const publicProjectQuerySchema = projectQuerySchema.omit({
  clientId: true,
});

export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join(", ");
    return { success: false, error: message };
  }

  return { success: true, data: result.data };
}