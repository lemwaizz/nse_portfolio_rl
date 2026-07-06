import type { AcknowledgeAction } from "@coordinator/models/infrastructure/general_responses";
import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";

type DeleteHoldingPayload = BaseCommandHandlerPayload<string> & {
  deletedById: string;
};

export abstract class DeleteHoldingCommandHandler {
  static runCommand = async (
    payload: DeleteHoldingPayload,
  ): Promise<AcknowledgeAction> => {
    const { deletedById, data, db, log } = payload;
    const holding = await db
      .deleteFrom("holding as h")
      .where("h.id", "=", data)
      .where("h.userId", "=", deletedById)
      .returning(["id"])
      .executeTakeFirstOrThrow();
    log?.info(`Holding deleted successfully with id ${holding.id}`);

    return {
      success: true,
    };
  };
}
