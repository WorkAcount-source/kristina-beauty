import { z } from "zod";

export const patchUserSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["role", "ban"]),
  value: z.union([z.string(), z.boolean()]).optional(),
});

export const postUserSchema = z.object({
  email: z.string().email(),
  action: z.literal("reset"),
});

export type PatchUserInput = z.infer<typeof patchUserSchema>;
export type PostUserInput = z.infer<typeof postUserSchema>;
