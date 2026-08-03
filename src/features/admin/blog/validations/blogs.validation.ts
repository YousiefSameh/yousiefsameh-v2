import { BlogPostCategory } from "@/app/generated/prisma/enums";
import z from "zod";

export const blogPostBaseSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens.",
    }),
  excerpt: z
    .string()
    .min(10, { message: "Excerpt must be at least 10 characters." }),
  content: z.custom<Record<string, unknown> | Array<unknown> | string | number | boolean>((val) => val !== undefined && val !== null, {
    message: "Content is required.",
  }),
  featuredImageUrl: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  category: z.nativeEnum(BlogPostCategory, {
    message: "Please select a category.",
  }),
  tags: z.array(z.string()).default([]),
  readingTimeMinutes: z.coerce.number().int().min(1).default(5),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const blogPostQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  isPublished: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  category: z.nativeEnum(BlogPostCategory).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type BlogPostQuery = z.infer<typeof blogPostQuerySchema>;

export const blogPostUpdateSchema = blogPostBaseSchema.partial();

export type BlogPostUpdateValues = z.infer<typeof blogPostUpdateSchema>;

export type BlogPostFormValues = z.infer<typeof blogPostBaseSchema>;
