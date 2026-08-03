import { ReportStatus } from "@/app/generated/prisma/enums";
import z from "zod";

export const reportBaseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  content: z.any().optional(),
  status: z.nativeEnum(ReportStatus).optional(),
});

export type ReportFormValues = z.infer<typeof reportBaseSchema>;

export const reportQuerySchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  search: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

export const createReportSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
});
export type CreateReportValues = z.infer<typeof createReportSchema>;