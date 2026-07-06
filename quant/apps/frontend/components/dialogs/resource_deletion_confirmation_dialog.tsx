"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@frontend/components/ui/alert-dialog";
import { toast } from "sonner";

export const ShowResourceDeletionConfirmationDialog = ({
  setShowDialog,
  showDialog,
  deleteHandler,
  resource,
  onSuccess,
}: {
  deleteHandler: () => Promise<boolean>;
  showDialog: boolean;
  setShowDialog?: Dispatch<SetStateAction<boolean>>;
  resource: string;
  onSuccess?: () => void;
}) => {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="">
            This action cannot be undone. This will permanently delete this{" "}
            {resource}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className=""
            onClick={() =>
              toast.promise(
                async () => {
                  const res = await deleteHandler();
                  if (res) onSuccess?.();
                  return res;
                },
                {
                  loading: `Deleting ${resource}`,
                  error: (e) =>
                    e instanceof Error
                      ? e.message
                      : `Error deleting ${resource}`,
                  success: (val) => {
                    if (!val) {
                      return `Failed to delete ${resource}`;
                    }
                    return `Succesfully deleted ${resource}`;
                  },
                  className: "text-foreground",
                },
              )
            }
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const useShowResourceDeletionConfirmationDialog = (
  deleteHandler: () => Promise<boolean>,
  resource: string,
) => {
  const [showDialog, setShowResourceDeletionConfirmationDialog] =
    useState(false);

  const ResourceDeletionConfirmationDialog = () => (
    <ShowResourceDeletionConfirmationDialog
      showDialog={showDialog}
      setShowDialog={setShowResourceDeletionConfirmationDialog}
      deleteHandler={deleteHandler}
      resource={resource}
    />
  );

  return {
    setShowResourceDeletionConfirmationDialog,
    ResourceDeletionConfirmationDialog,
  };
};
