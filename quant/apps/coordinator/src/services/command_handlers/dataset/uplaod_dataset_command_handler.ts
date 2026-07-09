import type { BaseCommandHandlerPayload } from "@coordinator/models/commands/command_handler_payload";
import type { ResourceCreated } from "@coordinator/models/infrastructure/general_responses";
import { status } from "elysia";
import { ingestNseCsv } from "@coordinator/services/command_handlers/dataset/pipeline";

type CreateHoldingPayload = BaseCommandHandlerPayload<undefined> & {
  file: File;
  uploadedById: string;
  year: string | undefined;
};

export abstract class UploadDatasetCommandHandler {
  static runCommand = async (
    payload: CreateHoldingPayload,
  ): Promise<ResourceCreated> => {
    const { file, uploadedById, data, db, log, year: yearField } = payload;

    const inferredYear = file.name.match(/(\d{4})/)?.[1];
    const year = yearField
      ? Number.parseInt(yearField, 10)
      : inferredYear
        ? Number.parseInt(inferredYear, 10)
        : NaN;

    if (!Number.isFinite(year)) {
      throw status(
        400,
        "Could not determine the file's year. Pass a `year` field, or name the file like NSE_data_all_stocks_2007.csv.",
      );
    }
    const csvText = await file.text();

    const dataset = await db
      .insertInto("dataset")
      .values({
        uploadedById: uploadedById,
        fileName: file.name,
        year: year,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    try {
      const summary = await ingestNseCsv(csvText, year, db);
      await db
        .updateTable("dataset")
        .where("dataset.id", "=", dataset.id)
        .set({ summary: summary })
        .execute();
      return { id: dataset.id };
    } catch (err) {
      throw status(500, "Unknown error");
    }
  };
}
