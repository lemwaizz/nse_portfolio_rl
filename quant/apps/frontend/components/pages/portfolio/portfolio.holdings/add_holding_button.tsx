"use client";
import { useDialog } from "@frontend/components/dialogs";
import { Button } from "@frontend/components/ui/button";

const AddHoldingButton = () => {
  const { setModifyHoldingDialog } = useDialog();

  return (
    <Button
      onClick={() => {
        setModifyHoldingDialog(true, undefined);
      }}
    >
      Add Holding
    </Button>
  );
};

export default AddHoldingButton;
