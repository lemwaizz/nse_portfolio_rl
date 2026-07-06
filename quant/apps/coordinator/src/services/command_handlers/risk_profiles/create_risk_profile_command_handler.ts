import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";
import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { CreateRiskProfileCommand } from "@coordinator/models/commands/risk_profile/create_risk_profile_command";
import { classifyRiskProfile } from "@coordinator/services/risk_prfile_copmuter.service";

type CreateRiskProfilePayload =
  BaseCommandHandlerPayload<CreateRiskProfileCommand> & {
    createdById: string;
  };

export abstract class CreateRiskProfileCommandHandler {
  static runCommand = async (
    payload: CreateRiskProfilePayload,
  ): Promise<ResourceCreated> => {
    const { createdById, data, db, log } = payload;
    const riskProfileCategory = classifyRiskProfile({
      investmentGoal: data.investmentGoal,
      investmentHorizon: data.investmentHorizon,
      lossReaction: data.lossReaction,
    });
    const riskProfile = await db
      .insertInto("risk_profile")
      .values({
        category: riskProfileCategory.category,
        userId: createdById,
        investementHorizon: data.investmentHorizon,
        investmentGoal: data.investmentGoal,
        lossReaction: data.lossReaction,
      })
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          category: riskProfileCategory.category,
          investementHorizon: data.investmentHorizon,
          investmentGoal: data.investmentGoal,
          lossReaction: data.lossReaction,
        }),
      )
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      id: riskProfile.id,
    };
  };
}
