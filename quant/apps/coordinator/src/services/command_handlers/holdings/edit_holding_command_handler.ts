import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { AcknowledgeAction } from "@coordinator/models/infrastructure/general_responses";
import type { EditHoldingCommand } from "@coordinator/models/commands/holdings/edit_holding_command";

type EditHoldingPayload = BaseCommandHandlerPayload<EditHoldingCommand> & {
  editedById: string;
  holdingId: string;
};

export abstract class EditHoldingComandHandler {
  static runCommand = async (
    payload: EditHoldingPayload,
  ): Promise<AcknowledgeAction> => {
    const { editedById, data, db, log, holdingId } = payload;

    await db
      .updateTable("holding as h")
      .set({
        companyId: data.companyId ?? undefined,
        averageSharePrice: data.averageSharePrice ?? undefined,
        shares: data.shares ?? undefined,
      })
      .where("h.userId", "=", editedById)
      .where("h.id", "=", holdingId)
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      success: true,
    };
  };
}
