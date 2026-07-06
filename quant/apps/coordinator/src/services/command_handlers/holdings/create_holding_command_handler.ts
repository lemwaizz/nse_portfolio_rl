import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { CreateHoldingCommand } from "@coordinator/models/commands/holdings/create_holding_command";
import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";

type CreateHoldingPayload = BaseCommandHandlerPayload<CreateHoldingCommand> & {
  createdById: string;
};

export abstract class CreateHoldingComandHandler {
  static runCommand = async (
    payload: CreateHoldingPayload,
  ): Promise<ResourceCreated> => {
    const { createdById, data, db, log } = payload;
    const holding = await db
      .insertInto("holding")
      .values({
        userId: createdById,
        companyId: data.companyId,
        averageSharePrice: data.averageSharePrice,
        shares: data.shares,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      id: holding.id,
    };
  };
}
