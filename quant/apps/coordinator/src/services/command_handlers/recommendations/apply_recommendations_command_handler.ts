import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";

type ApplyRecommendationCommandPayload = BaseCommandHandlerPayload<string> & {
  userId: string;
};
export abstract class ApplyRecommendationsCommandHandler {
  static runCommand = async (payload: ApplyRecommendationCommandPayload) => {
    const { data, db, userId, log } = payload;
  };
}
