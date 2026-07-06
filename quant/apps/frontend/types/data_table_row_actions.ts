import type { ColumnSort, Row, RowData } from "@tanstack/react-table";

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "delete";
}
