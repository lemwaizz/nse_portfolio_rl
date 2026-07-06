import { headers } from "next/headers";
import { DataTable } from "./holdings.data_table";
import { notFound } from "next/navigation";
import { apiClient } from "@/packages/clients/src";
import { Folder } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@frontend/components/ui/empty";
import AddHoldingButton from "@frontend/components/pages/portfolio/portfolio.holdings/add_holding_button";

export default async function HoldingsTable() {
  const reqHeaders = await headers();
  const { data, error } = await apiClient.api.holdings.get({
    headers: reqHeaders,
  });
  if (error) notFound();

  return (
    <div className="container mx-auto py-5 lg:py-10">
      {data.items.length <= 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Folder />
            </EmptyMedia>
            <EmptyTitle>No Holdings Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t added your holdings yet. Get started by adding
              your first holding.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <AddHoldingButton />
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={data.items} />
      )}
    </div>
  );
}
