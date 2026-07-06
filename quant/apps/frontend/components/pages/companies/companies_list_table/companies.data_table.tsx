"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@frontend/components/ui/table";
import React from "react";
import type { DataTableRowAction } from "@/apps/frontend/types/data_table_row_actions";
import type { CompanyListResponse } from "@/apps/coordinator/src/models/resources";
import { getCompanyColumns } from "./companies.columns";
import {
  ShowCreateCompanyiDialog,
  ShowResourceDeletionConfirmationDialog,
} from "../../../dialogs";
import { apiClient } from "@/packages/clients/src";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DataTableProps {
  data: CompanyListResponse["items"][0][];
}

export function DataTable({ data }: DataTableProps) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [rowAction, setRowAction] = React.useState<DataTableRowAction<
    CompanyListResponse["items"][0]
  > | null>(null);

  const columns = React.useMemo(
    () =>
      getCompanyColumns({
        setRowAction,
      }),
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {rowAction?.variant === "update" && (
        <ShowCreateCompanyiDialog
          showDialog={rowAction?.variant === "update"}
          company={rowAction?.row.original}
          setShowDialog={() => setRowAction(null)}
        />
      )}
      {rowAction?.variant === "delete" && (
        <ShowResourceDeletionConfirmationDialog
          showDialog={rowAction?.variant === "delete"}
          deleteHandler={async () => {
            if (!rowAction) return false;
            const { data, error } = await apiClient.api
              .companies({ id: rowAction!.row.original.id })
              .delete();
            if (error) {
              return false;
            }
            startTransition(() => {
              router.refresh();
            });
            return data.success;
          }}
          setShowDialog={() => setRowAction(null)}
          onSuccess={() => rowAction?.row.toggleSelected(false)}
          resource="Company"
        />
      )}
    </>
  );
}
