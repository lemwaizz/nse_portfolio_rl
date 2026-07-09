import type { BaseQueryHandlerPayload } from "@coordinator/models/queries/query_handler_payload";
import type { DatasetListResponse } from "@coordinator/models/resources";
import { jsonBuildObject } from "kysely/helpers/postgres";

export abstract class GetDatasetQueryHandler {
  static runQuery = async (
    payload: BaseQueryHandlerPayload<undefined>,
  ): Promise<DatasetListResponse> => {
    const { data, db, log } = payload;
    let query = db
      .selectFrom("dataset as d")
      .innerJoin("user as u", "u.id", "d.uploadedById")
      .select((eb) =>
        jsonBuildObject({
          id: eb.ref("u.id"),
          name: eb.ref("u.name"),
          image: eb.ref("u.image"),
        }).as("uploadedBy"),
      )
      .selectAll("d");

    const datasets = await query.execute();

    return {
      $paginationType: "offset",
      items: datasets.map((dataset) => {
        return {
          ...dataset,
          uploadedBy: dataset.uploadedBy,
          createdAt: dataset.createdAt.toISOString(),
        };
      }),
    };
  };
}
