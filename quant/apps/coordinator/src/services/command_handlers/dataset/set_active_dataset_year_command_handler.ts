import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { AcknowledgeAction } from "@coordinator/models/infrastructure/general_responses";
import type { SetActiveDatasetCommand } from "@coordinator/models/commands/dataset/set_active_dataset_command";
import { status } from "elysia";

type CreateHoldingPayload =
  BaseCommandHandlerPayload<SetActiveDatasetCommand> & {
    createdByRole?: string | null;
  };

export abstract class SetActiveDatasetYearCommandHandler {
  static runCommand = async (
    payload: CreateHoldingPayload,
  ): Promise<AcknowledgeAction> => {
    const { data, db, log, createdByRole } = payload;
    if (createdByRole != "admin") throw status(401);

    // receive the datasetId
    await db
      .updateTable("dataset as d")
      .where("d.isActiveYear", "=", true)
      .set({ isActiveYear: false })
      .execute();
    if (data.datasetId) {
      await db
        .updateTable("dataset as d")
        .where("d.id", "=", data.datasetId)
        .set({ isActiveYear: data.isActive ?? false })
        .execute();
    }

    return {
      success: true,
    };
  };
}

// also have a method to reset it back to null ie set all to false
