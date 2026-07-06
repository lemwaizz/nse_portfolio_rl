import Elysia from "elysia";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { feedbackModels } from "@coordinator/api/routes/feedback/feedback.models";
import { GetFeedbackQueryHandler } from "@coordinator/services/query_handlers/feedback/get_feedback_query_handler";
import { CreateFeedbackCommandHandler } from "@coordinator/services/command_handlers/feedback/create_feedback_command_handler";

export const feedbackController = new Elysia({
  name: "@quant/feedback",
  prefix: "feedback",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(feedbackModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetFeedbackQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "FeedbackListResponse",
    },
  )
  .post(
    "",
    (options) =>
      CreateFeedbackCommandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        createdById: options.user.id,
      }),
    {
      auth: true,
      response: "ResourceCreated",
      body: "CreateFeedbackCommand",
    },
  );
