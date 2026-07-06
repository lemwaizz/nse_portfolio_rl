"use client";

import { useDialog } from "@frontend/components/dialogs";
import { Button } from "@frontend/components/ui/button";
import { Plus } from "lucide-react";

export const PortfolioHeader = () => {
  const { setModifyHoldingDialog } = useDialog();
  return (
    <div className="flex justify-start sm:justify-between items-start sm:items-center gap-3 flex-col sm:flex-row">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Manage Portfolio</h2>
        <p className="text-muted-foreground max-w-lg">
          Refine your equity holdings. Add new positions or update your average
          cost to maintain an accurate view of your wealth
        </p>
      </div>
      <Button
        onClick={() => {
          setModifyHoldingDialog(true, undefined);
        }}
      >
        <Plus />
        Add New Holding
      </Button>
    </div>
  );
};
