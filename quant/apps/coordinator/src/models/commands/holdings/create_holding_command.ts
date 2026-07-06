import z from "zod";

export const CreateHoldingCommandSchema = z.object({
  companyId: z.string().nonempty(),
  shares: z.number().min(1),
  averageSharePrice: z.number(),
});

export type CreateHoldingCommand = z.infer<typeof CreateHoldingCommandSchema>;
