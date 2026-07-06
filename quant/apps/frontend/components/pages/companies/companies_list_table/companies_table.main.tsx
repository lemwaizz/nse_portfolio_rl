import { headers } from "next/headers";
import { DataTable } from "./companies.data_table";
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
import AddCompanyButton from "./add_company_button";

export default async function CompaniesTable() {
  const reqHeaders = await headers();
  const { data, error } = await apiClient.api.companies.get({
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
            <EmptyTitle>No Companies Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any companies yet. Get started by adding
              the first company.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <AddCompanyButton />
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={data.items} />
      )}
    </div>
  );
}
