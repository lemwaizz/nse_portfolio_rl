import z from "zod";
import { createCursorListResultSchema } from "@coordinator/models/queries";
import { createOffsetListResultSchema } from "@coordinator/models/queries";

export const FeedbackSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  feedback: z.string(),
  title: z.string(),
  response: z.unknown(),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

const FeedbackCursorListResponseSchema =
  createCursorListResultSchema(FeedbackSchema);
const FeedbackOffsetListResponseSchema =
  createOffsetListResultSchema(FeedbackSchema);

export const FeedbackListResponseSchema = z.union([
  FeedbackOffsetListResponseSchema,
  FeedbackCursorListResponseSchema,
]);
export type FeedbackListResponse = z.infer<typeof FeedbackListResponseSchema>;
