import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";

export const DatasetSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true, local: true }),
  fileName: z.string(),
  summary: z.unknown(),
  isActiveYear: z.boolean(),
  year: z.number(),
  uploadedBy: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export type Dataset = z.infer<typeof DatasetSchema>;

const DatasetCursorListResponseSchema =
  createCursorListResultSchema(DatasetSchema);
const DatasetOffsetListResponseSchema =
  createOffsetListResultSchema(DatasetSchema);

export const DatasetListResponseSchema = z.union([
  DatasetOffsetListResponseSchema,
  DatasetCursorListResponseSchema,
]);
export type DatasetListResponse = z.infer<typeof DatasetListResponseSchema>;
