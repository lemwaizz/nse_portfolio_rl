import Elysia from "elysia";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { companiesModels } from "@coordinator/api/routes/companies/companies.models";
import { GetCompaniesQueryHandler } from "@coordinator/services/query_handlers";
import { CreateCompanyCommandHandler } from "@coordinator/services/command_handlers/companies/create_company_command";
import { DeleteCompanyCommandHandler } from "@coordinator/services/command_handlers/companies/delete_company_command";

export const companiesController = new Elysia({
  name: "@quant/companies",
  prefix: "companies",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(companiesModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetCompaniesQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
      }),
    {
      auth: true,
      response: "CompanyListResponse",
    },
  )
  .post(
    "",
    (options) =>
      CreateCompanyCommandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        createdById: options.user.id,
        createdByRole: options.user.role,
      }),
    {
      auth: true,
      response: "ResourceCreated",
      body: "CreateCompanyCommand",
    },
  )
  .delete(
    "/:id",
    (options) =>
      DeleteCompanyCommandHandler.runCommand({
        db: options.db,
        data: options.params.id,
        log: options.log,
        deletedById: options.user.id,
        deletedByRole: options.user.role,
      }),
    {
      auth: true,
      response: "AcknowledgeResponse",
    },
  );
