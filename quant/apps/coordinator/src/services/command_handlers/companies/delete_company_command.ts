import type { AcknowledgeAction } from "@coordinator/models/infrastructure/general_responses";
import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import { status } from "elysia";

type DeleteCompanyPayload = BaseCommandHandlerPayload<string> & {
  deletedById: string;
  deletedByRole?: string | null;
};

export abstract class DeleteCompanyCommandHandler {
  static runCommand = async (
    payload: DeleteCompanyPayload,
  ): Promise<AcknowledgeAction> => {
    const { deletedById, data, db, log, deletedByRole } = payload;
    if (deletedByRole != "admin") throw status(401);
    const company = await db
      .deleteFrom("company as c")
      .where("c.id", "=", data)
      .returning(["id"])
      .executeTakeFirstOrThrow();
    log?.info(`Company deleted successfully with id ${company.id}`);

    return {
      success: true,
    };
  };
}
