import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";
import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { CreateCompanyCommand } from "@coordinator/models/commands/companies/create_company_command";
import { status } from "elysia";

type CreateCompanyPayload = BaseCommandHandlerPayload<CreateCompanyCommand> & {
  createdById: string;
  createdByRole?: string | null;
};

export abstract class CreateCompanyCommandHandler {
  static runCommand = async (
    payload: CreateCompanyPayload,
  ): Promise<ResourceCreated> => {
    const { createdById, data, db, log, createdByRole } = payload;
    if (createdByRole != "admin") throw status(401);
    const company = await db
      .insertInto("company")
      .values({
        createdById: createdById,
        name: data.name,
        ticker: data.ticker,
        logoUrl: data.logoUrl,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    log?.info(`Company created successfully with id ${company.id}`);
    return {
      id: company.id,
    };
  };
}
