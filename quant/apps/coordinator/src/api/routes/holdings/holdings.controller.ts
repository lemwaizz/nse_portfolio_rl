import Elysia from "elysia";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { holdingsModels } from "@coordinator/api/routes/holdings/holdings.models";
import { GetHoldingsQueryHandler } from "@coordinator/services/query_handlers";
import { CreateHoldingComandHandler } from "@coordinator/services/command_handlers/holdings/create_holding_command_handler";
import { DeleteHoldingCommandHandler } from "@coordinator/services/command_handlers/holdings/delete_holding_command_handler";
import { EditHoldingComandHandler } from "@coordinator/services/command_handlers/holdings/edit_holding_command_handler";
import { GetHoldingsMarketValueQueryHandler } from "@coordinator/services/query_handlers/holdings/get_holdings_market_value";

export const holdingsController = new Elysia({
  name: "@quant/holdings",
  prefix: "holdings",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(holdingsModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetHoldingsQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "HoldingListResponse",
    },
  )
  .get(
    "value",
    (options) =>
      GetHoldingsMarketValueQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "CurrentPortfolioMarkedValueResponse",
    },
  )
  .post(
    "",
    (options) =>
      CreateHoldingComandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        createdById: options.user.id,
      }),
    {
      auth: true,
      response: "ResourceCreated",
      body: "CreateHoldingCommand",
    },
  )
  .delete(
    "/:id",
    (options) =>
      DeleteHoldingCommandHandler.runCommand({
        db: options.db,
        data: options.params.id,
        log: options.log,
        deletedById: options.user.id,
      }),
    {
      auth: true,
      response: "AcknowledgeResponse",
    },
  )
  .patch(
    "/:id",
    (options) =>
      EditHoldingComandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        editedById: options.user.id,
        holdingId: options.params.id,
      }),
    {
      auth: true,
      response: "AcknowledgeResponse",
      body: "EditHoldingCommand",
    },
  );
