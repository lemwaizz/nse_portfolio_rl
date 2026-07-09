"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@frontend/components/ui/avatar";
import { FileChartLine, Pencil, Trash } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@frontend/components/ui/tooltip";
import { Button } from "@frontend/components/ui/button";
import type { CompanyListResponse } from "@coordinator/models/resources";
import type { DataTableRowAction } from "@/apps/frontend/types/data_table_row_actions";

export const truncate = (value: string, maxLength: number = 8) => {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength) + "...";
};

type GetWebhookTableColumnsProps = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<
      CompanyListResponse["items"][0]
    > | null>
  >;
};

export const getCompanyColumns = ({
  setRowAction,
}: GetWebhookTableColumnsProps): ColumnDef<
  CompanyListResponse["items"][0]
>[] => {
  return [
    {
      accessorKey: "status",
      header: "Company/Ticker",
      cell: ({ row }) => {
        const company = row.original;
        const imageUrl = company.logoUrl;
        const name = company.name;
        const ticker = company.ticker;
        return (
          <div className="flex gap-2 items-center">
            <Avatar className="h-8 w-8 rounded-lg">
              {imageUrl && <AvatarImage src={imageUrl!} alt={name} />}
              <AvatarFallback className="rounded-lg">
                <FileChartLine
                  className="text-muted-foreground"
                  strokeWidth={1.5}
                  size={16}
                />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="">{name}</div>
              <div className="font-bold text-muted-foreground text-xs">
                {ticker}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "logoUrl",
      header: "Logo Url",
      cell: ({ row }) => {
        const company = row.original;
        const imageUrl = company.logoUrl;
        return (
          <div className="text-muted-foreground">
            {imageUrl ? truncate(imageUrl, 50) : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: function Cell({ row }) {
        return (
          <div className="flex items-center justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 hover:text-foreground text-muted-foreground`}
                    onClick={() => {
                      setRowAction({ variant: "update", row: row });
                    }}
                  >
                    <div>
                      <Pencil className="h-5 w-5 " />
                      <span className="sr-only">Edit</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Edit</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 hover:text-foreground text-muted-foreground`}
                    onClick={() => {
                      setRowAction({ variant: "delete", row: row });
                    }}
                  >
                    <div>
                      <Trash className="h-5 w-5 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 20,
    },
  ];
};
