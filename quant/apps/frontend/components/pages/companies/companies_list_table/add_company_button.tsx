"use client";
import { useDialog } from "@frontend/components/dialogs";
import { Button } from "@frontend/components/ui/button";

const AddCompanyButton = () => {
  const { setCreateCompanyDialog } = useDialog();

  return (
    <Button
      onClick={() => {
        setCreateCompanyDialog(true, undefined);
      }}
    >
      Add Company
    </Button>
  );
};

export default AddCompanyButton;
