"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useCreateCompanyiDialog, useModifyHoldingDialog } from "./index";
import type { Company, Holding } from "@coordinator/models/resources";

export const DialogContext = createContext<{
  setModifyHoldingDialog: (show: boolean, holding?: Holding) => void;
  setCreateCompanyDialog: (show: boolean, holding?: Company) => void;
}>({
  setModifyHoldingDialog: () => {},
  setCreateCompanyDialog: () => {},
});

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const { setModifyHoldingDialog, ModifyHoldingDialog } =
    useModifyHoldingDialog();
  const { CreateCompanyDialog, setCreateCompanyDialog } =
    useCreateCompanyiDialog();

  return (
    <DialogContext.Provider
      value={{
        setModifyHoldingDialog: setModifyHoldingDialog,
        setCreateCompanyDialog: setCreateCompanyDialog,
      }}
    >
      <ModifyHoldingDialog />
      <CreateCompanyDialog />
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);
