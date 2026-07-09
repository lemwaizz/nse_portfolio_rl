import Elysia, { t } from "elysia";
import { kyselyDbPlugin } from "@coordinator/services/persistence/main_pg_db.provider";
import { loggerPlugin } from "@coordinator/plugins";
import { authGuardPlugin } from "@coordinator/services/auth/server_auth";
import { datasetModels } from "@coordinator/api/routes/dataset/dataset.models";
import { GetDatasetQueryHandler } from "@coordinator/services/query_handlers/dataset/get_dataset_query_handler";
import { UploadDatasetCommandHandler } from "@coordinator/services/command_handlers/dataset/uplaod_dataset_command_handler";
import { SetActiveDatasetYearCommandHandler } from "@coordinator/services/command_handlers/dataset/set_active_dataset_year_command_handler";

export const datasetController = new Elysia({
  name: "@quant/dataset",
  prefix: "dataset",
})
  .use(authGuardPlugin)
  .use(kyselyDbPlugin)
  .use(datasetModels)
  .use(loggerPlugin)
  .get(
    "",
    (options) =>
      GetDatasetQueryHandler.runQuery({
        db: options.db,
        data: undefined,
        log: options.log,
      }),
    {
      auth: true,
      response: "DatasetListResponse",
    },
  )
  .post(
    "",
    (options) =>
      UploadDatasetCommandHandler.runCommand({
        db: options.db,
        data: undefined,
        log: options.log,
        uploadedById: options.user.id,
        file: options.body.file,
        year: options.body.year,
      }),
    {
      auth: true,
      response: "ResourceCreated",
      body: t.Object({
        year: t.Optional(t.String()),
        file: t.File({
          type: "text/csv",
          maxSize: "10m", // 10 Megabytes
        }),
      }),
    },
  )
  .post(
    "active-year",
    (options) =>
      SetActiveDatasetYearCommandHandler.runCommand({
        db: options.db,
        data: options.body,
        log: options.log,
        createdByRole: options.user.role,
      }),
    {
      auth: true,
      response: "AcknowledgeResponse",
      body: "SetActiveDatasetCommand",
    },
  );
