import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.iso.datetime({ offset: true, local: true }),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullish(),
  }),
  ticker: z.string(),
  logoUrl: z.string().nullish(),
});

export type Company = z.infer<typeof CompanySchema>;

const CompanyCursorListResponseSchema =
  createCursorListResultSchema(CompanySchema);
const CompanyOffsetListResponseSchema =
  createOffsetListResultSchema(CompanySchema);

export const CompanyListResponseSchema = z.union([
  CompanyOffsetListResponseSchema,
  CompanyCursorListResponseSchema,
]);
export type CompanyListResponse = z.infer<typeof CompanyListResponseSchema>;
