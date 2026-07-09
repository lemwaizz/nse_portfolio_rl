import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";
import type { CreateFeedbackCommand } from "@coordinator/models/commands/feedback/create_feedback_command";

type CreateHoldingPayload = BaseCommandHandlerPayload<CreateFeedbackCommand> & {
  createdById: string;
};

export abstract class CreateFeedbackCommandHandler {
  static runCommand = async (
    payload: CreateHoldingPayload,
  ): Promise<ResourceCreated> => {
    const { createdById, data, db, log } = payload;

    const holding = await db
      .insertInto("feedback")
      .values({
        userId: createdById,
        feedback: data.feedback,
        title: data.title,
        response: data.response,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      id: holding.id,
    };
  };
}
