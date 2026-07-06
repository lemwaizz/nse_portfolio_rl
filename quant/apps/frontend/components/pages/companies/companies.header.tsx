"use client";
import { useDialog } from "@frontend/components/dialogs";
import { Button } from "@frontend/components/ui/button";
import { Plus } from "lucide-react";

const CompaniesHeader = () => {
  const { setCreateCompanyDialog } = useDialog();

  return (
    <div className="flex justify-start sm:justify-between items-start sm:items-center gap-3 flex-col sm:flex-row">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Companies</h2>
        <p className="text-muted-foreground max-w-lg">
          This is an admin fanction that is an entity whose shares users in the
          applciation can hold. These are organization listed in teh NSE.
        </p>
      </div>
      <Button
        onClick={() => {
          setCreateCompanyDialog(true, undefined);
        }}
      >
        <Plus />
        Add Company
      </Button>
    </div>
  );
};

export default CompaniesHeader;
