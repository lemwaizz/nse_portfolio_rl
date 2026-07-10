"use client";

import { useDatasets } from "@/apps/frontend/hooks/use_datasets";
import FileUpload03 from "./file_upload";
import { Spinner } from "../../ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@frontend/components/ui/empty";
import { Database, File, RefreshCw } from "lucide-react";
import type { DatasetListResponse } from "@/apps/coordinator/src/models/resources";
import type { IngestSummary } from "@/apps/coordinator/src/services/command_handlers/dataset/pipeline";
import { Badge } from "../../ui/badge";
import { formatToDateOnlyString } from "@/apps/frontend/utils/format_date";
import { Switch } from "@frontend/components/ui/switch";
import { apiClient } from "@/packages/clients/src";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { Button } from "../../ui/button";

const TrainingDataMainComponent = () => {
  const { mutate } = useSWRConfig();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <FileUpload03 />
      <div>
        <div className="flex gap-2 justify-between">
          <div>
            <h1 className="font-bold text-2xl">Dataset management</h1>
            <p className="text-muted-foreground">
              Review, validate and deploy financial training data
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                await apiClient.api.dataset["active-year"].post({
                  datasetId: null,
                  isActive: null,
                });
                mutate("/dataset");
                toast.success("Active dataset reset suessfully", {
                  className: "text-foreground",
                });
              } catch (error) {
                console.log(error);
                toast.error("Error resetting active dataset", {
                  className: "text-foreground",
                });
              }
            }}
          >
            <RefreshCw />
            Reset to TEST2
          </Button>
        </div>
        <div>
          <DatasetListItems />
        </div>
      </div>
    </div>
  );
};

const DatasetListItems = () => {
  const { datasets, error, isLoading } = useDatasets();
  if (isLoading)
    return (
      <div className="my-3">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="my-3 text-sm text-destructive">
        Failed to load datasets.
      </div>
    );
  if (!datasets || datasets.items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Database />
          </EmptyMedia>
          <EmptyTitle>No Datasets added yet</EmptyTitle>
          <EmptyDescription>
            No custom datasets have been added yet. Using the default TEST2
            data.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const visibleDatasets = datasets.items.slice(0, 5);
  const remainingCount = datasets.items.length - visibleDatasets.length;

  return (
    <div className="flex flex-col gap-3 my-4 px-4">
      {visibleDatasets.map((dataset) => (
        <SingleDatasetListTile key={dataset.id} dataset={dataset} />
      ))}
      {remainingCount > 0 && (
        <div className="text-sm text-muted-foreground">
          +{remainingCount} more dataset{remainingCount > 1 ? "s" : ""} not
          shown
        </div>
      )}
    </div>
  );
};

const SingleDatasetListTile = ({
  dataset,
}: {
  dataset: DatasetListResponse["items"][0];
}) => {
  const datasetAddSummary = dataset.summary as IngestSummary | undefined | null;
  const { mutate } = useSWRConfig();
  return (
    <div className="flex gap-2 justify-between items-center">
      <div className="flex flex-row gap-3 items-center">
        <div>
          <File />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-2 items-center">
            <p className="font-bold">{dataset.fileName}</p>
            {datasetAddSummary ? (
              <Badge>Processed</Badge>
            ) : (
              <Badge variant={"destructive"}>Processing Failed</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatToDateOnlyString(dataset.createdAt)}
          </p>

          {datasetAddSummary && (
            <>
              <div className="text-xs text-muted-foreground italic">
                Rows Parsed: {datasetAddSummary.rowsParsed}
              </div>
              <div className="text-xs text-muted-foreground italic">
                Rows Cleaned: {datasetAddSummary.rowsCleaned}
              </div>
              {datasetAddSummary.dateRange && (
                <div className="text-xs text-muted-foreground italic">
                  Date range:{" "}
                  {formatToDateOnlyString(datasetAddSummary.dateRange?.from)} -{" "}
                  {formatToDateOnlyString(datasetAddSummary.dateRange?.to)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Switch
        id="airplane-mode"
        checked={dataset.isActiveYear}
        disabled={!!datasetAddSummary === false}
        onCheckedChange={async (e) => {
          try {
            await apiClient.api.dataset["active-year"].post({
              datasetId: dataset.id,
              isActive: e,
            });
            mutate("/dataset");
            toast.success("Active dataset changed suessfully", {
              className: "text-foreground",
            });
          } catch (error) {
            console.log(error);
            toast.error("Error changing active dataset", {
              className: "text-foreground",
            });
          }
        }}
      />
    </div>
  );
};

export default TrainingDataMainComponent;
