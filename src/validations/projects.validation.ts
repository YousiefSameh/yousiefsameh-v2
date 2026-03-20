import { ProjectCategory, ProjectStatus, ProjectType } from "@/app/generated/prisma/enums";
import z from "zod";


export const projectBaseSchema = z.object({
  title: z.string().min(2, { error: "Title must be at least 2 characters." }),
  slug: z
    .string()
    .min(2, { error: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug must be lowercase alphanumeric with hyphens.",
    }),
  shortDescription: z.string().min(10, {
    error: "Short description must be at least 10 characters.",
  }),
  fullDescription: z.any().optional(),
  thumbnailUrl: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  category: z.nativeEnum(ProjectCategory, { error: "Please select a category." }),
  techStack: z.array(z.string()).default([]),
  status: z.nativeEnum(ProjectStatus, { error: "Please select a status." }),
  liveUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .default(new Date().getFullYear()),
  type: z
    .nativeEnum(ProjectType, { error: "Please select a type." })
    .default(ProjectType.PORTFOLIO),
  clientId: z.string().nullish(),
});

export const projectSchema = projectBaseSchema.superRefine((data, ctx) => {
  if (data.type === ProjectType.CLIENT && !data.clientId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Client is required for client projects",
      path: ["clientId"],
    });
  }
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
