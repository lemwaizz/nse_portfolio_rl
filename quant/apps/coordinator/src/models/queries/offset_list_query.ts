import { z } from "zod";

export const createOffsetListResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) => {
  return z.object({
    page: z.number().nullish(),
    perPage: z.number().nullish(),
    items: z.array(itemSchema),
    $paginationType: z.literal("offset").optional().default("offset"),
  });
};
