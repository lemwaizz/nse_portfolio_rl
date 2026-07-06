import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";
import { RiskProfileCategorySchema } from "@coordinator/models/enums/enums";

export const RiskProfileSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  category: RiskProfileCategorySchema,
});

export type RiskProfile = z.infer<typeof RiskProfileSchema>;

const RiskProfileCursorListResponseSchema =
  createCursorListResultSchema(RiskProfileSchema);
const RiskProfileOffsetListResponseSchema =
  createOffsetListResultSchema(RiskProfileSchema);

export const RiskProfileListResponseSchema = z.union([
  RiskProfileOffsetListResponseSchema,
  RiskProfileCursorListResponseSchema,
]);
export type RiskProfileListResponse = z.infer<
  typeof RiskProfileListResponseSchema
>;
