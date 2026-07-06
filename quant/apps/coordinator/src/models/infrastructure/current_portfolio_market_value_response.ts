import z from "zod";

export const CurrentPortfolioMarkedValueResponseSchema = z.object({
  marketValue: z.number(),
});

export type CurrentPortfolioMarkedValueResponse = z.infer<
  typeof CurrentPortfolioMarkedValueResponseSchema
>;
