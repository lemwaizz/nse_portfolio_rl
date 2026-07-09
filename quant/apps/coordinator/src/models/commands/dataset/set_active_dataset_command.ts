import z from "zod";

export const SetActiveDatasetCommandSchema = z.object({
  datasetId: z.string().nullish(),
  isActive: z.boolean().nullish(),
});

export type SetActiveDatasetCommand = z.infer<
  typeof SetActiveDatasetCommandSchema
>;
