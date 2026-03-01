import { z } from "zod";

export const createFormSchema = z.object({
    title: z
        .string()
        .min(1, "Form title is required")
        .max(100, "Title is too long"),
    description: z.string().optional(),
});

export type CreateFormValues = z.infer<typeof createFormSchema>;
