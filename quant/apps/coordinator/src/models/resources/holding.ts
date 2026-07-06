import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";
import { CompanySchema } from "./company";

export const HoldingSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  company: CompanySchema.omit({ createdBy: true }),
  shares: z.number(),
  averageSharePrice: z.number(),
});

export type Holding = z.infer<typeof HoldingSchema>;

const HoldingCursorListResponseSchema =
  createCursorListResultSchema(HoldingSchema);
const HoldingOffsetListResponseSchema =
  createOffsetListResultSchema(HoldingSchema);

export const HoldingListResponseSchema = z.union([
  HoldingOffsetListResponseSchema,
  HoldingCursorListResponseSchema,
]);
export type HoldingListResponse = z.infer<typeof HoldingListResponseSchema>;
