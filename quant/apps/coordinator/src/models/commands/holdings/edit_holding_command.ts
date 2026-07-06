import z from "zod";

export const EditHoldingCommandSchema = z.object({
  companyId: z.string().nullish(),
  shares: z.number().nullish(),
  averageSharePrice: z.number().nullish(),
});

export type EditHoldingCommand = z.infer<typeof EditHoldingCommandSchema>;
