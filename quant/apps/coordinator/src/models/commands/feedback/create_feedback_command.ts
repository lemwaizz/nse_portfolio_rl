import z from "zod";

export const CreateFeedbackCommandSchema = z.object({
  title: z.string(),
  feedback: z.string().nonempty(),
  response: z.unknown(),
});

export type CreateFeedbackCommand = z.infer<typeof CreateFeedbackCommandSchema>;
