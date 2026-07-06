import Elysia from "elysia";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { riskProfileModels } from "@coordinator/api/routes/risk_profiles/risk_profile.models";
import { GetRiskProfileQueryHandler } from "@coordinator/services/query_handlers/risk_profiles/get_risk_profile_query_handler";
import { CreateRiskProfileCommandHandler } from "@coordinator/services/command_handlers/risk_profiles/create_risk_profile_command_handler";

export const riskProfilesController = new Elysia({
  name: "@quant/riskProfiles",
  prefix: "risk-profile",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(riskProfileModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetRiskProfileQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
        userId: options.user.id,
      }),
    {
      auth: true,
      response: "RiskProfile",
    },
  )
  .put(
    "",
    (options) =>
      CreateRiskProfileCommandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        createdById: options.user.id,
      }),
    {
      auth: true,
      response: "ResourceCreated",
      body: "CreateRiskProfileCommand",
    },
  );
