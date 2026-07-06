"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@frontend/components/ui/avatar";
import { FileChartLine, Pencil, Trash } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@frontend/components/ui/tooltip";
import { Button } from "@frontend/components/ui/button";
import type {
  Holding,
  HoldingListResponse,
} from "@coordinator/models/resources";
import type { DataTableRowAction } from "@/apps/frontend/types/data_table_row_actions";

type GetWebhookTableColumnsProps = {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<
      HoldingListResponse["items"][0]
    > | null>
  >;
};
export const getHoldingsColumns = ({
  setRowAction,
}: GetWebhookTableColumnsProps): ColumnDef<Holding>[] => {
  return [
    {
      accessorKey: "status",
      header: "Company/Ticker",
      cell: ({ row }) => {
        const holding = row.original;
        const imageUrl = holding.company.logoUrl;
        const name = holding.company.name;
        const ticker = holding.company.name;
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
      accessorKey: "shares",
      header: "Shares",
    },
    {
      accessorKey: "averageSharePrice",
      header: "Avg.Price (KES)",
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
