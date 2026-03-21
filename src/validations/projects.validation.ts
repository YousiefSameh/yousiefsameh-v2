import {
  ProjectCategory,
  ProjectStatus,
  ProjectType,
} from "@/app/generated/prisma/enums";
import z from "zod";

export const projectBaseSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens.",
    }),
  shortDescription: z.string().min(10, {
    message: "Short description must be at least 10 characters.",
  }),
  fullDescription: z.any().optional(),
  thumbnailUrl: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  galleryImages: z.array(z.string()),
  category: z.nativeEnum(ProjectCategory, {
    message: "Please select a category.",
  }),
  techStack: z.array(z.string()),
  status: z.nativeEnum(ProjectStatus, { message: "Please select a status." }),
  liveUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  displayOrder: z.coerce.number().int(),
  year: z.coerce.number().int().min(2000).max(2100),
  type: z.nativeEnum(ProjectType),
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
