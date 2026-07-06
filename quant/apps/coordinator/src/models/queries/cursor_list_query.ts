import { z } from "zod";

export const createCursorListResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) => {
  return z.object({
    previousKey: z.string().nullish(),
    nextKey: z.string().nullish(),
    items: z.array(itemSchema),
    $paginationType: z.literal("cursor").optional().default("cursor"),
  });
};
