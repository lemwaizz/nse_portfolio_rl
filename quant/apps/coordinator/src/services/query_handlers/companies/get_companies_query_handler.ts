import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { CompanyListResponse } from "@coordinator/models/resources";
import { jsonBuildObject } from "kysely/helpers/postgres";

export abstract class GetCompaniesQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined>,
  ): Promise<CompanyListResponse> => {
    const { data, db, log } = payload;
    let query = db
      .selectFrom("company as c")
      .innerJoin("user as u", "u.id", "c.createdById")
      .select((eb) =>
        jsonBuildObject({
          id: eb.ref("u.id"),
          name: eb.ref("u.name"),
          image: eb.ref("u.image"),
        }).as("createdBy"),
      )
      .selectAll("c");

    const companies = await query.execute();

    return {
      $paginationType: "offset",
      items: companies.map((company) => {
        return {
          ...company,
          createdBy: company.createdBy,
          createdAt: company.createdAt.toISOString(),
        };
      }),
    };
  };
}
