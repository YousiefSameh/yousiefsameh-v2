import { PreferredContact } from "@/app/generated/prisma/enums";
import z from "zod";

export const clientBaseSchema = z.object({
  name:             z.string().min(2, { message: "Name must be at least 2 characters." }),
  email:            z.string().email({ message: "Invalid email." }).optional().or(z.literal("")),
  company:          z.string().optional(),
  avatarUrl:        z.string().optional(),
  notes:            z.string().optional(),
  tags:             z.array(z.string()),
  preferredContact: z.nativeEnum(PreferredContact).optional(),
  timezone:         z.string().optional(),
});

export const clientQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  tag:    z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientBaseSchema>;
export type ClientQuery      = z.infer<typeof clientQuerySchema>;