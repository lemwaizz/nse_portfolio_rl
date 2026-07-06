import { z } from "zod";

export const ResourceCreatedSchema = z.object({
  id: z.string().nonempty(),
});

export const AcknowledgeActionSchema = z.object({
  success: z.boolean(),
});

export type ResourceCreated = z.infer<typeof ResourceCreatedSchema>;
export type AcknowledgeAction = z.infer<typeof AcknowledgeActionSchema>;
